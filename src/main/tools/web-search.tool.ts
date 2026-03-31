import { GoogleGenAI } from '@google/genai';
import type { ToolDefinition } from './tool-types';

let searchClient: GoogleGenAI | null = null;

export function initWebSearchClient(apiKey: string): void {
  searchClient = new GoogleGenAI({ apiKey });
}

export const webSearchTool: ToolDefinition = {
  declaration: {
    name: 'google_web_search',
    description:
      'Search the web using Google Search for real-time information such as stock prices, news, weather, sports scores, current events, etc. Returns search results with citations.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        query: {
          type: 'STRING' as const,
          description: 'The search query',
        },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const query = String(args.query);

    if (!searchClient) {
      return { error: 'Search client not initialized' };
    }

    try {
      // Separate API call with googleSearch grounding (same as Gemini CLI)
      const response = await searchClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || '';
      const groundingMetadata = (response as Record<string, unknown>).candidates?.[0]?.groundingMetadata;

      return {
        query,
        result: text,
        groundingMetadata: groundingMetadata || null,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[WebSearch] Error:', msg);
      return { error: msg, query };
    }
  },
};
