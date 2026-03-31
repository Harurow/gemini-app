import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/app-store';
import { useChatStore } from '../../store/chat-store';

export function Header() {
  const settings = useAppStore((s) => s.settings);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const [cwd, setCwd] = useState('');

  useEffect(() => {
    window.api.getCwd().then(setCwd);
  }, []);

  // Shorten path: /Users/foo/code/project → ~/code/project
  const shortCwd = cwd.replace(/^\/Users\/[^/]+/, '~');

  return (
    <div className="h-12 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 titlebar-drag">
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="titlebar-no-drag p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mr-2 ml-16 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="titlebar-no-drag p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mr-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div className="flex-1 flex items-center justify-center gap-3 titlebar-no-drag">
        {activeSessionId && (
          <>
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {settings?.defaultModel || 'gemini-3-flash-preview'}
            </span>
            {cwd && (
              <span className="text-[10px] text-gray-400 dark:text-gray-600 truncate max-w-[200px]" title={cwd}>
                {shortCwd}
              </span>
            )}
          </>
        )}
      </div>

      <div className="w-8" />
    </div>
  );
}
