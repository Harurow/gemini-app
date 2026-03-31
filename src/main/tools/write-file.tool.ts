import fs from 'node:fs';
import path from 'node:path';
import type { ToolDefinition } from './tool-types';

export const writeFileTool: ToolDefinition = {
  requiresConfirmation: true,
  declaration: {
    name: 'write_file',
    description: 'Write content to a file. Creates the file if it does not exist, or overwrites it if it does.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        path: {
          type: 'STRING' as const,
          description: 'The absolute or relative path to the file to write',
        },
        content: {
          type: 'STRING' as const,
          description: 'The content to write to the file',
        },
      },
      required: ['path', 'content'],
    },
  },

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const filePath = String(args.path);
    const content = String(args.content);
    const resolvedPath = path.resolve(filePath);

    // Create parent directory if needed
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(resolvedPath, content, 'utf-8');

    return {
      path: resolvedPath,
      bytesWritten: Buffer.byteLength(content, 'utf-8'),
    };
  },
};
