import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  // Chat
  sendMessage: (
    sessionId: string,
    message: string,
    attachments?: Array<{ base64: string; mimeType: string; name: string }>,
  ) => Promise<{ success: boolean }>;
  onStreamChunk: (callback: (chunk: string) => void) => void;
  onStreamEnd: (callback: () => void) => void;
  onStreamFinalize: (callback: () => void) => void;
  onStreamError: (callback: (error: string) => void) => void;
  onToolCall: (callback: (info: unknown) => void) => void;
  onToolResult: (callback: (info: unknown) => void) => void;
  onUsage: (
    callback: (usage: { inputTokens: number; outputTokens: number; totalTokens: number; apiCalls: number }) => void,
  ) => void;
  cancelStream: () => Promise<{ success: boolean }>;

  // Sessions
  listSessions: () => Promise<unknown[]>;
  createSession: (templateId?: string) => Promise<unknown>;
  getSession: (id: string) => Promise<unknown>;
  deleteSession: (id: string) => Promise<boolean>;

  // App info
  getCwd: () => Promise<string>;

  // Settings
  getSettings: () => Promise<unknown>;
  updateSettings: (settings: Record<string, unknown>) => Promise<unknown>;
  validateApiKey: (key: string) => Promise<boolean>;

  // MCP (client)
  getMcpStatus: () => Promise<unknown[]>;
  restartMcp: () => Promise<unknown[]>;

  // MCP Server (host)
  getMcpServerStatus: () => Promise<{ running: boolean; port: number; sessionCount: number }>;
  startMcpServer: (port?: number) => Promise<{ running: boolean; port: number; sessionCount: number }>;
  stopMcpServer: () => Promise<{ running: boolean; port: number; sessionCount: number }>;

  // Update check
  checkForUpdate: () => Promise<{
    hasUpdate: boolean;
    currentVersion: string;
    latestVersion?: string;
    releaseUrl?: string;
    releaseName?: string;
  }>;

  // Tool confirmation
  onToolConfirmRequest: (callback: (data: { id: string; name: string; args: Record<string, unknown> }) => void) => void;
  respondToolConfirm: (id: string, approved: boolean) => Promise<void>;

  // App events
  onOpenSettings: (callback: () => void) => void;
  onNewChat: (callback: () => void) => void;
  onSessionUpdated: (callback: (data: { id: string; title: string }) => void) => void;

  // Cleanup
  removeAllListeners: (channel: string) => void;
}

const api: ElectronAPI = {
  // Chat
  sendMessage: (sessionId, message, attachments) => ipcRenderer.invoke('chat:send', sessionId, message, attachments),
  onStreamChunk: (cb) => ipcRenderer.on('chat:stream-chunk', (_, chunk) => cb(chunk)),
  onStreamEnd: (cb) => ipcRenderer.on('chat:stream-end', () => cb()),
  onStreamFinalize: (cb) => ipcRenderer.on('chat:stream-finalize', () => cb()),
  onStreamError: (cb) => ipcRenderer.on('chat:stream-error', (_, error) => cb(error)),
  onToolCall: (cb) => ipcRenderer.on('chat:tool-call', (_, info) => cb(info)),
  onToolResult: (cb) => ipcRenderer.on('chat:tool-result', (_, info) => cb(info)),
  onUsage: (cb) => ipcRenderer.on('chat:usage', (_, usage) => cb(usage)),
  cancelStream: () => ipcRenderer.invoke('chat:cancel'),

  // Sessions
  listSessions: () => ipcRenderer.invoke('session:list'),
  createSession: (templateId) => ipcRenderer.invoke('session:create', templateId),
  getSession: (id) => ipcRenderer.invoke('session:get', id),
  deleteSession: (id) => ipcRenderer.invoke('session:delete', id),

  // App info
  getCwd: () => ipcRenderer.invoke('app:get-cwd'),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),
  validateApiKey: (key) => ipcRenderer.invoke('settings:validate-key', key),

  // MCP (client)
  getMcpStatus: () => ipcRenderer.invoke('mcp:status'),
  restartMcp: () => ipcRenderer.invoke('mcp:restart'),

  // MCP Server (host)
  getMcpServerStatus: () => ipcRenderer.invoke('mcp-server:status'),
  startMcpServer: (port) => ipcRenderer.invoke('mcp-server:start', port),
  stopMcpServer: () => ipcRenderer.invoke('mcp-server:stop'),

  // Update check
  checkForUpdate: () => ipcRenderer.invoke('update:check'),

  // Tool confirmation
  onToolConfirmRequest: (cb) => ipcRenderer.on('tool:confirm-request', (_, data) => cb(data)),
  respondToolConfirm: (id, approved) => ipcRenderer.invoke('tool:confirm-response', id, approved),

  // App events
  onOpenSettings: (cb) => ipcRenderer.on('app:open-settings', () => cb()),
  onNewChat: (cb) => ipcRenderer.on('app:new-chat', () => cb()),
  onSessionUpdated: (cb) => ipcRenderer.on('session:updated', (_, data) => cb(data)),

  // Cleanup
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
};

contextBridge.exposeInMainWorld('api', api);
