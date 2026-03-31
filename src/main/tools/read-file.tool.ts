import fs from 'node:fs';
import path from 'node:path';
import type { ToolDefinition } from './tool-types';

export const readFileTool: ToolDefinition = {
  declaration: {
    name: 'read_file',
    description: 'Read the contents of a file at the given path. Returns the file content as text.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        path: {
          type: 'STRING' as const,
          description: 'The absolute or relative path to the file to read',
        },
        startLine: {
          type: 'INTEGER' as const,
          description: 'Optional start line number (1-based)',
        },
        endLine: {
          type: 'INTEGER' as const,
          description: 'Optional end line number (1-based, inclusive)',
        },
      },
      required: ['path'],
    },
  },

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const filePath = String(args.path);
    const resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(resolvedPath)) {
      return { error: `File not found: ${resolvedPath}` };
    }

    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      return { error: `Path is a directory: ${resolvedPath}` };
    }

    // Limit file size to 1MB
    if (stat.size > 1024 * 1024) {
      return { error: `File too large (${stat.size} bytes). Max: 1MB` };
    }

    const content = fs.readFileSync(resolvedPath, 'utf-8');

    if (args.startLine || args.endLine) {
      const lines = content.split('\n');
      const start = Math.max(1, Number(args.startLine) || 1) - 1;
      const end = Math.min(lines.length, Number(args.endLine) || lines.length);
      return {
        path: resolvedPath,
        content: lines.slice(start, end).join('\n'),
        totalLines: lines.length,
        shownLines: `${start + 1}-${end}`,
      };
    }

    return { path: resolvedPath, content, lines: content.split('\n').length };
  },
};
