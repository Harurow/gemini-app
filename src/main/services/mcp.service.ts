import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { McpServerConfig } from '../store';
import type { FunctionDeclaration } from '@google/genai';

interface McpConnection {
  client: Client;
  transport: unknown;
  config: McpServerConfig;
  status: 'connected' | 'disconnected' | 'error';
  tools: FunctionDeclaration[];
}

function jsonSchemaTypeToGeminiType(type: string): string {
  const map: Record<string, string> = {
    string: 'STRING',
    number: 'NUMBER',
    integer: 'INTEGER',
    boolean: 'BOOLEAN',
    array: 'ARRAY',
    object: 'OBJECT',
  };
  return map[type] || 'STRING';
}

function convertJsonSchemaToGemini(schema: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (schema.type) {
    result.type = jsonSchemaTypeToGeminiType(schema.type as string);
  }
  if (schema.description) {
    result.description = schema.description;
  }
  if (schema.properties) {
    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema.properties as Record<string, unknown>)) {
      props[key] = convertJsonSchemaToGemini(value as Record<string, unknown>);
    }
    result.properties = props;
  }
  if (schema.required) {
    result.required = schema.required;
  }
  if (schema.items) {
    result.items = convertJsonSchemaToGemini(schema.items as Record<string, unknown>);
  }
  if (schema.enum) {
    result.enum = schema.enum;
  }

  return result;
}

class McpService {
  private connections: Map<string, McpConnection> = new Map();

  async initialize(configs: McpServerConfig[]): Promise<void> {
    await this.shutdown();

    for (const config of configs) {
      if (!config.enabled && config.enabled !== undefined) continue;

      try {
        await this.connectServer(config);
      } catch (error) {
        console.error(`Failed to connect MCP server "${config.name}":`, error);
      }
    }
  }

  private async connectServer(config: McpServerConfig): Promise<void> {
    const transportType = config.transport || ((config as Record<string, unknown>).type as string);

    let transport: StdioClientTransport | StreamableHTTPClientTransport;

    if (transportType === 'http' && config.url) {
      // HTTP transport
      transport = new StreamableHTTPClientTransport(new URL(config.url));
    } else if (transportType === 'stdio' && config.command) {
      // Stdio transport
      transport = new StdioClientTransport({
        command: config.command,
        args: config.args || [],
        env: config.env as Record<string, string> | undefined,
      });
    } else {
      console.warn(`MCP server "${config.name}": unsupported transport "${transportType}"`);
      return;
    }

    const client = new Client({
      name: 'gemini-desktop',
      version: '1.0.0',
    });

    try {
      await client.connect(transport);

      const toolsResult = await client.listTools();
      const tools: FunctionDeclaration[] = (toolsResult.tools || []).map((tool) => {
        const declaration: FunctionDeclaration = {
          name: `mcp_${config.name}_${tool.name}`,
          description: tool.description || `MCP tool: ${tool.name}`,
        };

        if (tool.inputSchema) {
          declaration.parameters = convertJsonSchemaToGemini(
            tool.inputSchema as Record<string, unknown>,
          ) as FunctionDeclaration['parameters'];
        }

        return declaration;
      });

      this.connections.set(config.name, {
        client,
        transport,
        config,
        status: 'connected',
        tools,
      });
    } catch (error) {
      this.connections.set(config.name, {
        client,
        transport,
        config,
        status: 'error',
        tools: [],
      });
      throw error;
    }
  }

  getTools(): FunctionDeclaration[] {
    const allTools: FunctionDeclaration[] = [];
    for (const conn of this.connections.values()) {
      if (conn.status === 'connected') {
        allTools.push(...conn.tools);
      }
    }
    return allTools;
  }

  async executeTool(fullName: string, args: Record<string, unknown>): Promise<unknown> {
    const prefix = 'mcp_';
    const withoutPrefix = fullName.slice(prefix.length);
    const firstUnderscore = withoutPrefix.indexOf('_');
    if (firstUnderscore === -1) {
      throw new Error(`Invalid MCP tool name: ${fullName}`);
    }

    const serverName = withoutPrefix.slice(0, firstUnderscore);
    const toolName = withoutPrefix.slice(firstUnderscore + 1);

    const conn = this.connections.get(serverName);
    if (!conn || conn.status !== 'connected') {
      throw new Error(`MCP server "${serverName}" is not connected`);
    }

    const result = await conn.client.callTool({ name: toolName, arguments: args });
    return result;
  }

  isMcpTool(name: string): boolean {
    return name.startsWith('mcp_');
  }

  getStatus(): Array<{ name: string; status: string; toolCount: number }> {
    return Array.from(this.connections.entries()).map(([name, conn]) => ({
      name,
      status: conn.status,
      toolCount: conn.tools.length,
    }));
  }

  async shutdown(): Promise<void> {
    for (const [, conn] of this.connections.entries()) {
      try {
        await conn.client.close();
      } catch {
        // Ignore close errors
      }
    }
    this.connections.clear();
  }
}

export const mcpService = new McpService();
