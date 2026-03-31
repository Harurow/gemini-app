export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  toolCalls?: ToolCallDisplay[];
  attachments?: Array<{ name: string; mimeType: string }>;
  timestamp: number;
}

export interface ToolCallDisplay {
  id: string;
  name: string;
  args: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: unknown;
  error?: string;
  duration?: number;
}

export interface SessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  messageCount: number;
  origin?: 'local' | 'mcp';
}

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  origin?: 'local' | 'mcp';
  messages: Array<{
    role: string;
    parts: Array<{ text?: string; functionCall?: unknown; functionResponse?: unknown }>;
  }>;
}
