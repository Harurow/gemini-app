import { exec } from 'node:child_process';
import type { ToolDefinition } from './tool-types';

const DEFAULT_TIMEOUT = 30_000; // 30 seconds
const MAX_OUTPUT_SIZE = 100_000; // 100KB

export const shellTool: ToolDefinition = {
  requiresConfirmation: true,
  declaration: {
    name: 'run_shell_command',
    description: 'Execute a shell command and return its output. Use this to run system commands, scripts, or tools.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        command: {
          type: 'STRING' as const,
          description: 'The shell command to execute',
        },
        cwd: {
          type: 'STRING' as const,
          description: 'Working directory for the command (defaults to home directory)',
        },
        timeout: {
          type: 'INTEGER' as const,
          description: 'Timeout in milliseconds (default: 30000, max: 120000)',
        },
      },
      required: ['command'],
    },
  },

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const command = String(args.command);
    const cwd = args.cwd ? String(args.cwd) : process.env.HOME || '/';
    const timeout = Math.min(Number(args.timeout) || DEFAULT_TIMEOUT, 120_000);

    return new Promise((resolve) => {
      exec(
        command,
        {
          cwd,
          timeout,
          maxBuffer: MAX_OUTPUT_SIZE,
          env: { ...process.env },
        },
        (error, stdout, stderr) => {
          const result: Record<string, unknown> = {
            command,
            cwd,
            exitCode: error?.code ?? 0,
          };

          if (stdout) {
            result.stdout =
              stdout.length > MAX_OUTPUT_SIZE ? stdout.slice(0, MAX_OUTPUT_SIZE) + '\n... (output truncated)' : stdout;
          }

          if (stderr) {
            result.stderr =
              stderr.length > MAX_OUTPUT_SIZE ? stderr.slice(0, MAX_OUTPUT_SIZE) + '\n... (output truncated)' : stderr;
          }

          if (error && !error.code) {
            result.error = error.message;
          }

          resolve(result);
        },
      );
    });
  },
};
