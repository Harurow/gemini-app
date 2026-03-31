import { exec } from 'node:child_process';
import type { ToolDefinition } from './tool-types';

export const globTool: ToolDefinition = {
  declaration: {
    name: 'glob',
    description: 'Find files matching a glob pattern. Returns a list of matching file paths.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        pattern: {
          type: 'STRING' as const,
          description: 'The glob pattern to match (e.g., "**/*.ts", "src/**/*.tsx")',
        },
        cwd: {
          type: 'STRING' as const,
          description: 'The directory to search from',
        },
        maxResults: {
          type: 'INTEGER' as const,
          description: 'Maximum number of results (default: 100)',
        },
      },
      required: ['pattern', 'cwd'],
    },
  },

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const pattern = String(args.pattern);
    const cwd = String(args.cwd);
    const maxResults = Number(args.maxResults) || 100;

    // Use find command as a cross-platform glob alternative
    const cmd = `find "${cwd}" -name "${pattern.replace(/\*\*\//g, '')}" -type f 2>/dev/null | head -${maxResults}`;

    return new Promise((resolve) => {
      exec(cmd, { timeout: 15_000, maxBuffer: 100_000 }, (error, stdout) => {
        const files = stdout.trim().split('\n').filter(Boolean);
        resolve({ files, totalFiles: files.length });
      });
    });
  },
};
