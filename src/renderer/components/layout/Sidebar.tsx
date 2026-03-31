import React from 'react';
import { useSessions } from '../../hooks/useSessions';
import { useChatStore } from '../../store/chat-store';
import { useAppStore } from '../../store/app-store';
import { useI18n } from '../../i18n';

export function Sidebar() {
  const { sessions, createSession, deleteSession } = useSessions();
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const setActiveSession = useChatStore((s) => s.setActiveSession);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const unreadSessionIds = useAppStore((s) => s.unreadSessionIds);
  const { t } = useI18n();

  if (!sidebarOpen) return null;

  const handleNewChat = async () => {
    const session = await createSession();
    if (session) {
      setActiveSession(session.id);
    }
  };

  const handleSelectSession = (id: string) => {
    setActiveSession(id);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteSession(id);
    if (activeSessionId === id) {
      setActiveSession(null as unknown as string);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('sidebar.today');
    if (diffDays === 1) return t('sidebar.yesterday');
    if (diffDays < 7) return t('sidebar.daysAgo', { n: diffDays });
    return date.toLocaleDateString();
  };

  return (
    <div className="w-[260px] h-full flex flex-col bg-[#f0f4f9] dark:bg-[#1e1f20] border-r border-gray-200/50 dark:border-white/5">
      {/* Drag region */}
      <div className="h-12 titlebar-drag flex-shrink-0" />

      {/* New Chat */}
      <div className="px-3 pb-3 titlebar-no-drag">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#d3e3fd] dark:bg-[#004a77] text-[#001d35] dark:text-[#c2e7ff] text-sm font-medium hover:shadow-md transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('sidebar.newChat')}
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => handleSelectSession(session.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSelectSession(session.id);
            }}
            className={`w-full text-left px-3 py-2.5 rounded-full mb-0.5 group flex items-center justify-between transition-colors cursor-pointer ${
              activeSessionId === session.id
                ? 'bg-[#d3e3fd] dark:bg-[#004a77]/60'
                : 'hover:bg-gray-200/60 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {(session as { origin?: string }).origin === 'mcp' ? (
                <svg
                  className="w-4 h-4 flex-shrink-0 text-purple-500 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              )}
              <span className="text-sm truncate">{session.title || t('sidebar.newChat')}</span>
              {unreadSessionIds.has(session.id) && (
                <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
              )}
            </div>
            <button
              onClick={(e) => handleDeleteSession(e, session.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-300/60 dark:hover:bg-white/10 transition-all"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-gray-200/50 dark:border-white/5">
        <button
          onClick={() => useAppStore.getState().setSettingsOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-white/5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {t('sidebar.settings')}
        </button>
      </div>
    </div>
  );
}
