import {
  GoogleGenAI,
  type Content,
  type Part,
  type FunctionDeclaration,
  type GenerateContentConfig,
} from '@google/genai';
import type { ToolCallInfo, ToolResultInfo } from '../tools/tool-types';
import type { ToolRegistry } from '../tools/tool-registry';
import { initWebSearchClient } from '../tools/web-search.tool';

// Model fallback chain: if rate limited, try next model
const MODEL_FALLBACK: Record<string, string> = {
  'gemini-3.1-pro-preview': 'gemini-3-flash-preview',
  'gemini-3-flash-preview': 'gemini-2.5-flash',
  'gemini-3.1-flash-lite-preview': 'gemini-2.5-flash-lite',
  'gemini-2.5-pro': 'gemini-2.5-flash',
  'gemini-2.5-flash': 'gemini-2.5-flash-lite',
};

export class GeminiService {
  private client: GoogleGenAI | null = null;
  private abortController: AbortController | null = null;
  initialize(apiKey: string): void {
    if (!apiKey || apiKey.trim() === '') return;
    this.client = new GoogleGenAI({ apiKey });
    // Initialize web search client with same API key
    initWebSearchClient(apiKey);
  }

  isInitialized(): boolean {
    return this.client !== null;
  }

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async sendMessage(options: {
    model: string;
    message: string;
    attachments?: Array<{ base64: string; mimeType: string; name: string }>;
    history: Content[];
    systemInstruction?: string;
    toolRegistry: ToolRegistry;
    onChunk: (text: string) => void;
    onFinalizeChunk: () => void;
    onToolCall: (info: ToolCallInfo) => void;
    onToolResult: (info: ToolResultInfo) => void;
    onUsage?: (usage: { inputTokens: number; outputTokens: number; totalTokens: number; apiCalls: number }) => void;
  }): Promise<Content[]> {
    if (!this.client) {
      throw new Error('API キーが未設定です。設定画面で Gemini API キーを設定してください。');
    }

    let { model } = options;
    const {
      message,
      attachments,
      history,
      systemInstruction,
      toolRegistry,
      onChunk,
      onFinalizeChunk,
      onToolCall,
      onToolResult,
      onUsage,
    } = options;

    this.abortController = new AbortController();
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let apiCallCount = 0;

    // Build user message parts: text + optional file attachments
    const userParts: Part[] = [];
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        userParts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.base64,
          },
        });
      }
    }
    userParts.push({ text: message });

    // Compress history if too long (> 50 messages) to save tokens
    const compressedHistory = history.length > 50 ? await this.compressHistory(model, history) : history;

    const contents: Content[] = [...compressedHistory, { role: 'user', parts: userParts }];
    const newContents: Content[] = [{ role: 'user', parts: userParts }];

    const declarations = toolRegistry.getDeclarations();

    // google_web_search is registered as a function declaration tool.
    // When called, it makes a separate API call with { googleSearch: {} }
    // This matches the Gemini CLI architecture (ADR-013).
    const config: GenerateContentConfig = {
      systemInstruction: systemInstruction || undefined,
      tools: declarations.length > 0 ? [{ functionDeclarations: declarations }] : undefined,
    };

    // Agentic tool loop — matches Gemini CLI architecture (ADR-014)
    // All API calls use non-streaming generateContent to preserve thought_signature.
    // Text is sent to UI in chunks for visual streaming effect.
    let loopCount = 0;
    const maxLoops = 20;

    while (loopCount < maxLoops) {
      loopCount++;

      if (this.abortController?.signal.aborted) break;

      const functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
      let modelContent: Content;

      try {
        // Non-streaming call with retry (exponential backoff, max 4 attempts)
        const response = await this.retryWithBackoff(
          () => this.client!.models.generateContent({ model, contents, config }),
          4,
          1000,
        );

        // Get the complete response content (with thought_signature intact)
        modelContent = (response.candidates?.[0]?.content as Content) || { role: 'model', parts: [] };
        if (!modelContent.role) modelContent.role = 'model';

        // Track token usage
        apiCallCount++;
        const usage = response.usageMetadata;
        if (usage) {
          totalInputTokens += (usage as Record<string, number>).promptTokenCount || 0;
          totalOutputTokens += (usage as Record<string, number>).candidatesTokenCount || 0;
        }
        if (onUsage) {
          onUsage({
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            totalTokens: totalInputTokens + totalOutputTokens,
            apiCalls: apiCallCount,
          });
        }

        // Send text to UI and finalize as a message if there are also function calls
        const responseText = response.text || '';
        if (responseText) {
          this.sendTextInChunks(responseText, onChunk);
        }

        // Check if there are function calls
        const hasFunctionCalls = modelContent.parts?.some((p) => p.functionCall);

        // If we have text AND function calls, finalize the text as a separate message
        // so it doesn't get concatenated with the next loop's response
        if (responseText && hasFunctionCalls) {
          onFinalizeChunk();
        }

        // Extract function calls
        for (const part of modelContent.parts || []) {
          if (part.functionCall) {
            functionCalls.push({
              name: part.functionCall.name!,
              args: (part.functionCall.args as Record<string, unknown>) || {},
            });
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') break;

        const isRateLimit = this.isRateLimitError(error);
        const fallbackModel = MODEL_FALLBACK[model];

        if (isRateLimit && fallbackModel && loopCount <= 2) {
          console.log(`[Gemini] Rate limited on ${model}, falling back to ${fallbackModel}`);
          model = fallbackModel;
          onChunk(`\n> *${model} にフォールバック (レート制限)*\n\n`);
          continue;
        }

        const errMsg = this.parseApiError(error);
        throw new Error(errMsg);
      }

      // Add model response to conversation history
      contents.push(modelContent);
      newContents.push(modelContent);

      // No function calls → done
      if (functionCalls.length === 0) break;

      console.log(`[Gemini] Tool calls: ${functionCalls.map((fc) => fc.name).join(', ')}`);

      // Execute tools and build function responses
      const functionResponses: Part[] = [];

      for (const fc of functionCalls) {
        const callId = `${fc.name}_${Date.now()}`;
        onToolCall({ id: callId, name: fc.name, args: fc.args, status: 'running' });

        const startTime = Date.now();
        try {
          const result = await toolRegistry.execute(fc.name, fc.args);
          const duration = Date.now() - startTime;
          onToolResult({ id: callId, name: fc.name, result, duration });
          functionResponses.push({ functionResponse: { name: fc.name, response: { result } } });
        } catch (error: unknown) {
          const duration = Date.now() - startTime;
          const errorMsg = error instanceof Error ? error.message : String(error);
          onToolResult({ id: callId, name: fc.name, result: null, error: errorMsg, duration });
          functionResponses.push({ functionResponse: { name: fc.name, response: { error: errorMsg } } });
        }
      }

      // Add tool responses to conversation history
      const toolResponseContent: Content = { role: 'user', parts: functionResponses };
      contents.push(toolResponseContent);
      newContents.push(toolResponseContent);
    }

    this.abortController = null;
    return newContents;
  }

  private async compressHistory(model: string, history: Content[]): Promise<Content[]> {
    if (!this.client) return history;

    // Keep the last 10 messages as-is, summarize the rest
    const recentCount = 10;
    const oldMessages = history.slice(0, -recentCount);
    const recentMessages = history.slice(-recentCount);

    // Extract text from old messages for summarization
    const oldText = oldMessages
      .filter((c) => c.role === 'user' || c.role === 'model')
      .map((c) => {
        const text =
          c.parts
            ?.filter((p) => 'text' in p)
            .map((p) => (p as { text: string }).text)
            .join(' ') || '';
        return `${c.role}: ${text.slice(0, 200)}`;
      })
      .join('\n');

    if (!oldText.trim()) return history;

    try {
      console.log(`[Gemini] Compressing ${oldMessages.length} old messages`);
      const summary = await this.client.models.generateContent({
        model,
        contents: `以下の会話を簡潔に要約してください。重要なコンテキスト、決定事項、ユーザーの要望を保持してください。\n\n${oldText}`,
      });

      const summaryText = summary.text || '';
      if (summaryText) {
        return [
          { role: 'user', parts: [{ text: `[以前の会話の要約]\n${summaryText}` }] },
          { role: 'model', parts: [{ text: '承知しました。以前の会話の内容を踏まえて対応します。' }] },
          ...recentMessages,
        ];
      }
    } catch (error) {
      console.error('[Gemini] History compression failed:', error);
    }

    return history;
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number, baseDelay: number): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        const isRetryable =
          this.isRateLimitError(error) ||
          (error instanceof Error && (error.message.includes('503') || error.message.includes('UNAVAILABLE')));

        if (!isRetryable || attempt === maxRetries - 1) throw error;

        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`[Gemini] Retry ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  private sendTextInChunks(text: string, onChunk: (chunk: string) => void): void {
    // Send as single chunk to avoid Markdown rendering issues (cut/duplicate text)
    // Non-streaming generateContent returns complete text, so no need to split
    onChunk(text);
  }

  private isRateLimitError(error: unknown): boolean {
    const raw = error instanceof Error ? error.message : String(error);
    return raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('rate');
  }

  private parseApiError(error: unknown): string {
    const raw = error instanceof Error ? error.message : String(error);

    // Try to extract JSON error
    try {
      const match = raw.match(/\{[\s\S]*"error"[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const code = parsed.error?.code;
        const message = parsed.error?.message;

        if (code === 401 || code === 403) {
          return `認証エラー (${code}): API キーが無効です。設定画面で正しい API キーを設定してください。`;
        }
        if (code === 429) {
          return 'レート制限に達しました。しばらく待ってから再試行してください。';
        }
        if (code === 400) {
          return `リクエストエラー: ${message || raw}`;
        }
        if (code === 404) {
          return `モデルが見つかりません。設定画面でモデルを変更してください。`;
        }
        if (message) {
          return `API エラー (${code}): ${message}`;
        }
      }
    } catch {
      // JSON parse failed, use raw message
    }

    if (raw.includes('ENOTFOUND') || raw.includes('ECONNREFUSED') || raw.includes('fetch failed')) {
      return 'ネットワークエラー: インターネット接続を確認してください。';
    }

    return `エラー: ${raw}`;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new GoogleGenAI({ apiKey });
      const response = await testClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Hello',
      });
      return !!response.text;
    } catch {
      return false;
    }
  }
}

export const geminiService = new GeminiService();
