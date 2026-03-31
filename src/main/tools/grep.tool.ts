import { exec } from 'node:child_process';
import type { ToolDefinition } from './tool-types';

export const grepTool: ToolDefinition = {
  declaration: {
    name: 'grep',
    description: 'Search for a pattern in files. Returns matching lines with file paths and line numbers.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        pattern: {
          type: 'STRING' as const,
          description: 'The regex pattern to search for',
        },
        path: {
          type: 'STRING' as const,
          description: 'The directory or file to search in',
        },
        include: {
          type: 'STRING' as const,
          description: 'File glob pattern to include (e.g., "*.ts")',
        },
        maxResults: {
          type: 'INTEGER' as const,
          description: 'Maximum number of results to return (default: 50)',
        },
      },
      required: ['pattern', 'path'],
    },
  },

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const pattern = String(args.pattern);
    const searchPath = String(args.path);
    const include = args.include ? `--include="${String(args.include)}"` : '';
    const maxResults = Number(args.maxResults) || 50;

    const cmd = `grep -rn ${include} -m ${maxResults} "${pattern.replace(/"/g, '\\"')}" "${searchPath}" 2>/dev/null | head -${maxResults}`;

    return new Promise((resolve) => {
      exec(cmd, { timeout: 15_000, maxBuffer: 100_000 }, (error, stdout) => {
        if (!stdout.trim()) {
          resolve({ matches: [], message: 'No matches found' });
          return;
        }

        const matches = stdout
          .trim()
          .split('\n')
          .map((line) => {
            const match = line.match(/^(.+?):(\d+):(.*)$/);
            if (match) {
              return { file: match[1], line: parseInt(match[2]), content: match[3] };
            }
            return { content: line };
          });

        resolve({ matches, totalMatches: matches.length });
      });
    });
  },
};
