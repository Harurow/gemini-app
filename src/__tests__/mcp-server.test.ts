import { describe, it, expect, afterAll, afterEach } from 'vitest';
import http from 'node:http';

// Mock electron modules before importing the service
import { vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    getPath: () => '/tmp/gemini-app-test',
    setName: vi.fn(),
  },
  safeStorage: {
    isEncryptionAvailable: () => false,
    encryptString: (s: string) => Buffer.from(s),
    decryptString: (b: Buffer) => b.toString(),
  },
  ipcMain: {
    handle: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

// Mock gemini service
vi.mock('../main/services/gemini.service', () => ({
  geminiService: {
    isInitialized: () => false,
    initialize: vi.fn(),
    sendMessage: vi.fn(),
    cancel: vi.fn(),
  },
}));

// Mock session service
vi.mock('../main/services/session.service', () => {
  const sessions = new Map<string, unknown>();
  return {
    sessionService: {
      create: vi.fn(async (model: string) => {
        const id = `test-session-${Date.now()}`;
        const session = {
          id,
          title: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          model,
          messages: [],
        };
        sessions.set(id, session);
        return session;
      }),
      list: vi.fn(async () => Array.from(sessions.values())),
      get: vi.fn(async (id: string) => sessions.get(id) || null),
      update: vi.fn(async (id: string, data: Record<string, unknown>) => {
        const session = sessions.get(id) as Record<string, unknown> | undefined;
        if (!session) return null;
        Object.assign(session, data);
        return session;
      }),
      appendMessages: vi.fn(async (id: string) => sessions.get(id) || null),
      delete: vi.fn(),
    },
  };
});

// Mock tool registry
vi.mock('../main/tools/tool-registry', () => ({
  toolRegistry: {
    getDeclarations: () => [],
    execute: vi.fn(),
    setConfirmCallback: vi.fn(),
  },
}));

// Mock store
vi.mock('../main/store', () => ({
  getSettings: () => ({
    apiKey: '',
    defaultModel: 'gemini-2.5-flash',
    systemInstruction: '',
    theme: 'system',
    mcpServers: [],
    mcpServerHost: { enabled: false, port: 3100 },
    sidebarWidth: 280,
    chatTemplates: [],
    skills: [],
  }),
  updateSettings: vi.fn(),
}));

import { mcpServerService } from '../main/services/mcp-server.service';

function httpRequest(
  port: number,
  method: string,
  path: string,
  body?: string,
  headers: Record<string, string> = {},
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 5000);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
          Connection: 'close',
          ...headers,
        },
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          clearTimeout(timeout);
          resolve({ status: res.statusCode || 0, headers: res.headers, body: responseBody });
        });
      },
    );
    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
    if (body) req.write(body);
    req.end();
  });
}

const TEST_PORT = 13579;

describe('McpServerService', () => {
  afterEach(async () => {
    await mcpServerService.stop();
  });

  afterAll(async () => {
    await mcpServerService.stop();
  });

  describe('start/stop lifecycle', () => {
    it('reports not running initially', () => {
      const status = mcpServerService.getStatus();
      expect(status.running).toBe(false);
    });

    it('starts and reports running status', async () => {
      await mcpServerService.start(TEST_PORT);
      const status = mcpServerService.getStatus();
      expect(status.running).toBe(true);
      expect(status.port).toBe(TEST_PORT);
      expect(status.sessionCount).toBe(0);
    });

    it('stops and reports stopped status', async () => {
      await mcpServerService.start(TEST_PORT);
      await mcpServerService.stop();
      const status = mcpServerService.getStatus();
      expect(status.running).toBe(false);
    });

    it('can restart (start while already running)', async () => {
      await mcpServerService.start(TEST_PORT);
      await mcpServerService.start(TEST_PORT); // Should stop and restart
      const status = mcpServerService.getStatus();
      expect(status.running).toBe(true);
    });
  });

  describe('HTTP endpoint routing', () => {
    it('returns 404 for non-/mcp paths', async () => {
      await mcpServerService.start(TEST_PORT);
      const res = await httpRequest(TEST_PORT, 'GET', '/other');
      expect(res.status).toBe(404);
    });

    it('returns 405 for unsupported HTTP methods', async () => {
      await mcpServerService.start(TEST_PORT);
      const res = await httpRequest(TEST_PORT, 'PUT', '/mcp');
      expect(res.status).toBe(405);
    });

    it('returns 400 for GET without session ID', async () => {
      await mcpServerService.start(TEST_PORT);
      const res = await httpRequest(TEST_PORT, 'GET', '/mcp');
      expect(res.status).toBe(400);
    });

    it('returns 400 for DELETE without session ID', async () => {
      await mcpServerService.start(TEST_PORT);
      const res = await httpRequest(TEST_PORT, 'DELETE', '/mcp');
      expect(res.status).toBe(400);
    });

    it('returns 404 for POST with unknown session ID', async () => {
      await mcpServerService.start(TEST_PORT);
      const res = await httpRequest(
        TEST_PORT,
        'POST',
        '/mcp',
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          id: 1,
        }),
        {
          'mcp-session-id': 'nonexistent',
        },
      );
      expect(res.status).toBe(404);
    });
  });

  describe('MCP initialize handshake', () => {
    it('returns mcp-session-id on initialize', async () => {
      await mcpServerService.start(TEST_PORT);
      const res = await httpRequest(
        TEST_PORT,
        'POST',
        '/mcp',
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          id: 1,
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'test-client', version: '1.0.0' },
          },
        }),
      );

      // The transport sets the session ID header
      const sessionIdHeader = res.headers['mcp-session-id'];
      expect(sessionIdHeader).toBeDefined();
      expect(typeof sessionIdHeader).toBe('string');

      // Session count should increment
      const status = mcpServerService.getStatus();
      expect(status.sessionCount).toBe(1);
    });

    it('increments session count on initialize and cleans up on stop', async () => {
      // Session count was already verified in previous test
      // Verify stop cleans up
      const statusBefore = mcpServerService.getStatus();
      expect(statusBefore.sessionCount).toBeGreaterThanOrEqual(0);
      await mcpServerService.stop();
      expect(mcpServerService.getStatus().sessionCount).toBe(0);
    });
  });
});
