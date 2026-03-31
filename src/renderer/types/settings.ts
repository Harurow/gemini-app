export interface McpServerConfig {
  name: string;
  transport: 'stdio' | 'http';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  enabled: boolean;
}

export interface McpServerSettings {
  enabled: boolean;
  port: number;
}

export interface AppSettings {
  apiKey: string;
  defaultModel: string;
  systemInstruction: string;
  theme: 'light' | 'dark' | 'system';
  mcpServers: McpServerConfig[];
  mcpServerHost: McpServerSettings;
  sidebarWidth: number;
}

export interface McpStatus {
  name: string;
  status: string;
  toolCount: number;
}
