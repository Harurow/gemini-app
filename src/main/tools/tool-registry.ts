import type { FunctionDeclaration } from '@google/genai';
import type { ToolDefinition } from './tool-types';
import { readFileTool } from './read-file.tool';
import { writeFileTool } from './write-file.tool';
import { editFileTool } from './edit-file.tool';
import { shellTool } from './shell.tool';
import { grepTool } from './grep.tool';
import { globTool } from './glob.tool';
import { webFetchTool } from './web-fetch.tool';
import { webSearchTool } from './web-search.tool';
import { createSkillTool } from './create-skill.tool';
import { mcpService } from '../services/mcp.service';

export type ConfirmCallback = (name: string, args: Record<string, unknown>) => Promise<boolean>;

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private confirmCallback: ConfirmCallback | null = null;

  constructor() {
    this.registerBuiltinTools();
  }

  private registerBuiltinTools(): void {
    this.register(readFileTool);
    this.register(writeFileTool);
    this.register(editFileTool);
    this.register(shellTool);
    this.register(grepTool);
    this.register(globTool);
    this.register(webFetchTool);
    this.register(webSearchTool);
    this.register(createSkillTool);
  }

  setConfirmCallback(cb: ConfirmCallback): void {
    this.confirmCallback = cb;
  }

  register(tool: ToolDefinition): void {
    this.tools.set(tool.declaration.name!, tool);
  }

  getDeclarations(): FunctionDeclaration[] {
    const builtinDeclarations = Array.from(this.tools.values()).map((t) => t.declaration);
    const mcpDeclarations = mcpService.getTools();
    return [...builtinDeclarations, ...mcpDeclarations];
  }

  async execute(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (mcpService.isMcpTool(name)) {
      return mcpService.executeTool(name, args);
    }

    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Ask for user confirmation if required
    if (tool.requiresConfirmation && this.confirmCallback) {
      const approved = await this.confirmCallback(name, args);
      if (!approved) {
        return { denied: true, message: 'User denied tool execution' };
      }
    }

    return tool.execute(args);
  }
}

export const toolRegistry = new ToolRegistry();
