import React, { useState } from 'react';
import type { ToolCallDisplay } from '../../types/chat';
import { Spinner } from '../common/Spinner';
import { useI18n } from '../../i18n';

interface ToolCallBlockProps {
  toolCall: ToolCallDisplay;
}

export function ToolCallBlock({ toolCall }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useI18n();

  const statusIcon = () => {
    switch (toolCall.status) {
      case 'running':
      case 'pending':
        return <Spinner size="sm" className="text-blue-500" />;
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  const formatArgs = () => {
    const entries = Object.entries(toolCall.args);
    if (entries.length === 0) return '';
    const firstVal = String(entries[0][1]);
    return firstVal.length > 60 ? firstVal.slice(0, 60) + '...' : firstVal;
  };

  return (
    <div className="my-2 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        {statusIcon()}
        <span className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300">{toolCall.name}</span>
        <span className="text-xs text-gray-500 truncate flex-1 text-left">{formatArgs()}</span>
        {toolCall.duration !== undefined && <span className="text-xs text-gray-400">{toolCall.duration}ms</span>}
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-500 mb-1">{t('tool.arguments')}</div>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
              {JSON.stringify(toolCall.args, null, 2)}
            </pre>
          </div>
          {(toolCall.result !== undefined || toolCall.error) && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">
                {toolCall.error ? t('tool.error') : t('tool.result')}
              </div>
              <pre
                className={`text-xs p-2 rounded overflow-x-auto ${
                  toolCall.error
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                {toolCall.error || JSON.stringify(toolCall.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
