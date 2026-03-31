import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { BrowserWindow } from 'electron';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { geminiService } from './gemini.service';
import { sessionService } from './session.service';
import { toolRegistry } from '../tools/tool-registry';
import { getSettings } from '../store';

/**
 * MCP Server Service (ADR-018)
 *
 * Gemini Desktop アプリを MCP サーバーとして公開。
 * 外部 MCP クライアントから HTTP 経由でチャット機能を利用可能にする。
 */

interface McpSession {
  sessionId: string;
  transport: StreamableHTTPServerTransport;
  server: McpServer;
}

function notifySessionUpdate(sessionId: string, title: string): void {
  const windows = BrowserWindow.getAllWindows();
  for (const win of windows) {
    win.webContents.send('session:updated', { id: sessionId, title });
  }
}

class McpServerService {
  private httpServer: http.Server | null = null;
  private sessions = new Map<string, McpSession>();
  private port = 3100;
  private bindAddress = '127.0.0.1';
  private isRunning = false;

  /**
   * MCP サーバーを起動
   */
  async start(port: number = 3100, host: 'localhost' | 'lan' = 'localhost'): Promise<void> {
    if (this.isRunning) {
      await this.stop();
    }

    this.port = port;
    this.bindAddress = host === 'lan' ? '0.0.0.0' : '127.0.0.1';

    this.httpServer = http.createServer(async (req, res) => {
      try {
        await this.handleRequest(req, res);
      } catch (error) {
        console.error('[MCP Server] Unhandled error:', error);
        if (!res.writableEnded) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      }
    });

    return new Promise((resolve, reject) => {
      this.httpServer!.listen(port, this.bindAddress, () => {
        this.isRunning = true;
        console.log(`[MCP Server] Listening on http://${this.bindAddress}:${port}/mcp`);
        resolve();
      });

      this.httpServer!.on('error', (err) => {
        this.isRunning = false;
        console.error('[MCP Server] Failed to start:', err);
        reject(err);
      });
    });
  }

  /**
   * MCP サーバーを停止
   */
  async stop(): Promise<void> {
    // Close all sessions
    for (const [, session] of this.sessions) {
      try {
        await session.transport.close();
        await session.server.close();
      } catch {
        // Ignore close errors
      }
    }
    this.sessions.clear();

    if (this.httpServer) {
      return new Promise((resolve) => {
        this.httpServer!.close(() => {
          this.httpServer = null;
          this.isRunning = false;
          console.log('[MCP Server] Stopped');
          resolve();
        });
      });
    }
    this.isRunning = false;
  }

  /**
   * ステータス取得
   */
  getStatus(): { running: boolean; port: number; host: string; sessionCount: number } {
    return {
      running: this.isRunning,
      port: this.port,
      host: this.bindAddress,
      sessionCount: this.sessions.size,
    };
  }

  /**
   * HTTP リクエストハンドラ
   */
  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname !== '/mcp') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found. Use /mcp endpoint.' }));
      return;
    }

    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (req.method === 'POST') {
      await this.handlePost(req, res, sessionId);
    } else if (req.method === 'GET') {
      await this.handleGet(req, res, sessionId);
    } else if (req.method === 'DELETE') {
      await this.handleDelete(req, res, sessionId);
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
  }

  private async handlePost(req: http.IncomingMessage, res: http.ServerResponse, sessionId?: string): Promise<void> {
    // No session ID → this should be an initialize request; create new session
    if (!sessionId) {
      try {
        const newSession = await this.createSession();
        await newSession.transport.handleRequest(req, res);
      } catch (error) {
        console.error('[MCP Server] Initialize error:', error);
        if (!res.writableEnded) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to initialize session' }));
        }
      }
      return;
    }

    // Existing session
    const session = this.sessions.get(sessionId);
    if (!session) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
      return;
    }

    try {
      await session.transport.handleRequest(req, res);
    } catch (error) {
      console.error('[MCP Server] POST error:', error);
      if (!res.writableEnded) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    }
  }

  private async handleGet(req: http.IncomingMessage, res: http.ServerResponse, sessionId?: string): Promise<void> {
    if (!sessionId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing mcp-session-id header' }));
      return;
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
      return;
    }

    try {
      await session.transport.handleRequest(req, res);
    } catch (error) {
      console.error('[MCP Server] GET error:', error);
      if (!res.writableEnded) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal error' }));
      }
    }
  }

  private async handleDelete(req: http.IncomingMessage, res: http.ServerResponse, sessionId?: string): Promise<void> {
    if (!sessionId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing mcp-session-id header' }));
      return;
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
      return;
    }

    try {
      // Let the transport handle the DELETE (it sends proper response)
      await session.transport.handleRequest(req, res);
    } catch {
      // Ignore transport close errors
    } finally {
      try {
        await session.transport.close();
        await session.server.close();
      } catch {
        // Ignore close errors
      }
      this.sessions.delete(sessionId);
    }
  }

  /**
   * 新しい MCP セッションを作成し、ツールを登録
   */
  private async createSession(): Promise<McpSession> {
    const server = new McpServer({
      name: 'gemini-desktop',
      version: '1.0.0',
    });

    this.registerTools(server);

    // Pre-generate session ID so we can use it as the map key
    const sessionId = randomUUID();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
    });

    await server.connect(transport);

    const session: McpSession = { sessionId, transport, server };
    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * MCP ツールを登録
   */
  private registerTools(server: McpServer): void {
    // --- send_message ---
    server.tool(
      'send_message',
      'チャットセッションにメッセージを送信し、AI の応答を取得する。テキスト・画像・PDF・ファイルを添付可能。',
      {
        sessionId: z.string().describe('チャットセッション ID。create_session で作成したもの。'),
        text: z.string().describe('送信するテキストメッセージ'),
        attachments: z
          .array(
            z.object({
              base64: z.string().describe('ファイルの Base64 エンコードデータ'),
              mimeType: z.string().describe('MIME タイプ (image/png, application/pdf, text/plain 等)'),
              name: z.string().describe('ファイル名'),
            }),
          )
          .optional()
          .describe('添付ファイル (画像、PDF、テキスト等)'),
      },
      async ({ sessionId, text, attachments }) => {
        // Gemini 初期化チェック
        if (!geminiService.isInitialized()) {
          const settings = getSettings();
          if (settings.apiKey) {
            geminiService.initialize(settings.apiKey);
          } else {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: 'エラー: API キーが未設定です。Gemini Desktop の設定画面で API キーを設定してください。',
                },
              ],
              isError: true,
            };
          }
        }

        const session = await sessionService.get(sessionId);
        if (!session) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `エラー: セッション "${sessionId}" が見つかりません。create_session でセッションを作成してください。`,
              },
            ],
            isError: true,
          };
        }

        const settings = getSettings();

        try {
          let responseText = '';
          const toolCalls: Array<{ name: string; duration: number }> = [];
          const newContents = await geminiService.sendMessage({
            model: session.model || settings.defaultModel,
            message: text,
            attachments: attachments as Array<{ base64: string; mimeType: string; name: string }>,
            history: session.messages,
            systemInstruction: session.systemInstruction || settings.systemInstruction || undefined,
            toolRegistry,
            onChunk: (chunk) => {
              responseText += chunk;
            },
            onFinalizeChunk: () => {
              /* MCP ではストリーミングしない */
            },
            onToolCall: (info) => {
              console.log(`[MCP Server] Tool call: ${info.name}`);
            },
            onToolResult: (info) => {
              console.log(`[MCP Server] Tool result: ${info.name} (${info.duration}ms)`);
              toolCalls.push({ name: info.name, duration: info.duration || 0 });
            },
          });

          // セッションにメッセージを保存
          const updatedSession = await sessionService.appendMessages(sessionId, newContents);

          // UI にセッション更新を通知 (サイドバー反映)
          if (updatedSession) {
            notifySessionUpdate(updatedSession.id, updatedSession.title);
          }

          // ツール実行があった場合は詳細を付加
          let result = responseText || '(応答なし)';
          if (toolCalls.length > 0) {
            const toolSummary = toolCalls.map((tc) => `  - ${tc.name} (${tc.duration}ms)`).join('\n');
            result += `\n\n---\n[実行されたツール]\n${toolSummary}`;
          }

          return {
            content: [{ type: 'text' as const, text: result }],
          };
        } catch (error: unknown) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          return {
            content: [{ type: 'text' as const, text: `エラー: ${errorMsg}` }],
            isError: true,
          };
        }
      },
    );

    // --- create_session ---
    server.tool(
      'create_session',
      '新しいチャットセッションを作成する。返されたセッション ID を send_message で使用する。',
      {
        model: z.string().optional().describe('使用する Gemini モデル (省略時はデフォルトモデル)'),
        systemInstruction: z.string().optional().describe('システムプロンプト (省略可)'),
      },
      async ({ model, systemInstruction }) => {
        const settings = getSettings();
        const session = await sessionService.create(model || settings.defaultModel);

        if (systemInstruction) {
          await sessionService.update(session.id, { systemInstruction });
        }

        // UI にセッション作成を通知 (サイドバー反映)
        notifySessionUpdate(session.id, session.title || 'New Chat');

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  sessionId: session.id,
                  model: session.model,
                  createdAt: session.createdAt,
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

    // --- list_sessions ---
    server.tool('list_sessions', 'チャットセッション一覧を取得する。', {}, async () => {
      const sessions = await sessionService.list();
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(sessions, null, 2),
          },
        ],
      };
    });

    // --- get_session ---
    server.tool(
      'get_session',
      'チャットセッションの詳細 (メッセージ履歴) を取得する。',
      {
        sessionId: z.string().describe('チャットセッション ID'),
      },
      async ({ sessionId }) => {
        const session = await sessionService.get(sessionId);
        if (!session) {
          return {
            content: [{ type: 'text' as const, text: `エラー: セッション "${sessionId}" が見つかりません。` }],
            isError: true,
          };
        }

        // メッセージからテキスト部分を抽出して返す
        const messages = session.messages.map((msg) => {
          const texts = (msg.parts || []).filter((p): p is { text: string } => 'text' in p).map((p) => p.text);
          return {
            role: msg.role,
            text: texts.join('\n'),
          };
        });

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  id: session.id,
                  title: session.title,
                  model: session.model,
                  createdAt: session.createdAt,
                  updatedAt: session.updatedAt,
                  messageCount: session.messages.length,
                  messages,
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );
  }
}

export const mcpServerService = new McpServerService();
