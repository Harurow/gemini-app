import type { FunctionDeclaration } from '@google/genai';

export interface ToolCallInfo {
  id: string;
  name: string;
  args: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface ToolResultInfo {
  id: string;
  name: string;
  result: unknown;
  error?: string;
  duration: number;
}

export interface ToolDefinition {
  declaration: FunctionDeclaration;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
  requiresConfirmation?: boolean; // If true, ask user before executing
}
