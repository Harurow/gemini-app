import { net } from 'electron';
import type { ToolDefinition } from './tool-types';

const MAX_RESPONSE_SIZE = 100_000; // 100KB

export const webFetchTool: ToolDefinition = {
  declaration: {
    name: 'web_fetch',
    description:
      'Fetch content from a URL. Returns the response body as text. Use this to search the web or read web pages for real-time information like stock prices, news, weather, etc.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        url: {
          type: 'STRING' as const,
          description: 'The URL to fetch. For web search, use https://www.google.com/search?q=YOUR_QUERY',
        },
        method: {
          type: 'STRING' as const,
          description: 'HTTP method (default: GET)',
        },
      },
      required: ['url'],
    },
  },

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const url = String(args.url);
    const method = String(args.method || 'GET').toUpperCase();

    try {
      // Use Electron's net.fetch (works in Main Process, handles proxy/certs)
      const response = await net.fetch(url, {
        method,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja,en;q=0.9',
        },
      });

      const contentType = response.headers.get('content-type') || '';
      let body: string;

      if (contentType.includes('application/json')) {
        const json = await response.json();
        body = JSON.stringify(json, null, 2);
      } else {
        body = await response.text();
      }

      if (body.length > MAX_RESPONSE_SIZE) {
        body = body.slice(0, MAX_RESPONSE_SIZE) + '\n... (truncated)';
      }

      return {
        url,
        status: response.status,
        contentType,
        body,
        size: body.length,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return { error: msg, url };
    }
  },
};
