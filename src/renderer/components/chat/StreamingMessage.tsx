import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ToolCallBlock } from './ToolCallBlock';
import { Spinner } from '../common/Spinner';
import { useI18n } from '../../i18n';
import type { ToolCallDisplay } from '../../types/chat';

interface StreamingMessageProps {
  text: string;
  toolCalls: ToolCallDisplay[];
}

function StatusIndicator({ toolCalls }: { toolCalls: ToolCallDisplay[] }) {
  const { t } = useI18n();

  const runningCall = toolCalls.find((tc) => tc.status === 'running' || tc.status === 'pending');

  if (runningCall) {
    const label = getToolStatusLabel(runningCall.name, runningCall.args, t);
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 text-gray-500 dark:text-gray-400">
        <div className="relative flex items-center justify-center w-5 h-5">
          <Spinner size="sm" />
        </div>
        <span className="text-sm">{label}</span>
        <span className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 text-gray-500 dark:text-gray-400">
      <div className="relative flex items-center justify-center w-5 h-5">
        <div className="absolute w-3 h-3 rounded-full bg-blue-400/30 animate-ping" />
        <div className="w-2 h-2 rounded-full bg-blue-500" />
      </div>
      <span className="text-sm">{t('chat.thinking')}</span>
    </div>
  );
}

function getToolStatusLabel(name: string, args: Record<string, unknown>, t: (key: string) => string): string {
  switch (name) {
    case 'web_fetch':
      return t('chat.status.searching');
    case 'read_file':
      return `${t('chat.status.reading')} ${truncate(String(args.path || ''))}`;
    case 'write_file':
    case 'edit_file':
      return `${t('chat.status.writing')} ${truncate(String(args.path || ''))}`;
    case 'run_shell_command':
      return `${t('chat.status.running')} ${truncate(String(args.command || ''))}`;
    case 'grep':
      return `${t('chat.status.searching')} ${truncate(String(args.pattern || ''))}`;
    case 'glob':
      return `${t('chat.status.searching')} ${truncate(String(args.pattern || ''))}`;
    default:
      if (name.startsWith('mcp_')) {
        return `${t('chat.status.mcpTool')} ${name.replace('mcp_', '')}`;
      }
      return `${t('chat.status.executing')} ${name}`;
  }
}

function truncate(s: string, max = 40): string {
  return s.length > max ? s.slice(0, max) + '...' : s;
}

export function StreamingMessage({ text, toolCalls }: StreamingMessageProps) {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        {/* Completed tool calls */}
        {toolCalls
          .filter((tc) => tc.status === 'completed' || tc.status === 'error')
          .map((tc) => (
            <ToolCallBlock key={tc.id} toolCall={tc} />
          ))}

        {/* Active status indicator (only when no running tool blocks) */}
        {!text && toolCalls.every((tc) => tc.status === 'completed' || tc.status === 'error') && (
          <StatusIndicator toolCalls={[]} />
        )}

        {/* Running tool calls with status */}
        {toolCalls
          .filter((tc) => tc.status === 'running' || tc.status === 'pending')
          .map((tc) => (
            <ToolCallBlock key={tc.id} toolCall={tc} />
          ))}

        {/* Streaming text */}
        {text && (
          <div className="px-1 py-1">
            <MarkdownRenderer content={text} />
            <span className="inline-block w-2 h-4 bg-blue-500 dark:bg-blue-400 animate-pulse ml-0.5 rounded-sm" />
          </div>
        )}
      </div>
    </div>
  );
}
