import fs from 'node:fs';
import path from 'node:path';
import type { ToolDefinition } from './tool-types';

export const editFileTool: ToolDefinition = {
  requiresConfirmation: true,
  declaration: {
    name: 'edit_file',
    description:
      'Edit a file by replacing a specific string with new content. Use this for partial modifications instead of rewriting the entire file.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        path: {
          type: 'STRING' as const,
          description: 'The absolute or relative path to the file to edit',
        },
        old_string: {
          type: 'STRING' as const,
          description: 'The exact string to find and replace (must be unique in the file)',
        },
        new_string: {
          type: 'STRING' as const,
          description: 'The replacement string',
        },
      },
      required: ['path', 'old_string', 'new_string'],
    },
  },

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const filePath = String(args.path);
    const oldString = String(args.old_string);
    const newString = String(args.new_string);
    const resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(resolvedPath)) {
      return { error: `File not found: ${resolvedPath}` };
    }

    const content = fs.readFileSync(resolvedPath, 'utf-8');
    const occurrences = content.split(oldString).length - 1;

    if (occurrences === 0) {
      return { error: 'old_string not found in file' };
    }
    if (occurrences > 1) {
      return { error: `old_string found ${occurrences} times. It must be unique. Provide more context.` };
    }

    const newContent = content.replace(oldString, newString);
    fs.writeFileSync(resolvedPath, newContent, 'utf-8');

    return {
      path: resolvedPath,
      replaced: true,
      linesChanged: newString.split('\n').length - oldString.split('\n').length,
    };
  },
};
