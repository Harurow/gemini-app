import React, { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';

interface ConfirmRequest {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export function ToolConfirmDialog() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    window.api.onToolConfirmRequest((data) => {
      setRequest(data as ConfirmRequest);
    });

    return () => {
      window.api.removeAllListeners('tool:confirm-request');
    };
  }, []);

  if (!request) return null;

  const handleRespond = (approved: boolean) => {
    window.api.respondToolConfirm(request.id, approved);
    setRequest(null);
  };

  const getDescription = () => {
    if (request.name === 'run_shell_command') {
      return String(request.args.command || '');
    }
    if (request.name === 'write_file') {
      return String(request.args.path || '');
    }
    return JSON.stringify(request.args, null, 2);
  };

  const toolLabel =
    request.name === 'run_shell_command'
      ? t('tool.confirm.shell')
      : request.name === 'write_file'
        ? t('tool.confirm.write')
        : request.name;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-24 pointer-events-none">
      <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-lg w-full mx-4 animate-in slide-in-from-bottom">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-1">{toolLabel}</p>
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded-lg overflow-x-auto max-h-[120px] font-mono">
              {getDescription()}
            </pre>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={() => handleRespond(false)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {t('tool.confirm.deny')}
          </button>
          <button
            onClick={() => handleRespond(true)}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {t('tool.confirm.allow')}
          </button>
        </div>
      </div>
    </div>
  );
}
