import React, { useEffect, useRef, useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { ChatView } from './components/chat/ChatView';
import { SettingsModal } from './components/settings/SettingsModal';
import { ToolConfirmDialog } from './components/chat/ToolConfirmDialog';
import { UpdateBanner } from './components/common/UpdateBanner';
import { GeminiIcon } from './components/common/GeminiIcon';
import { useAppStore } from './store/app-store';
import { useChatStore } from './store/chat-store';
import { useSettings } from './hooks/useSettings';
import { useSessions } from './hooks/useSessions';
import { useTheme } from './hooks/useTheme';
import { useI18n } from './i18n';

const DEFAULT_ICON = 'M13 10V3L4 14h7v7l9-11h-7z';

function WelcomeScreen() {
  const { createSession } = useSessions();
  const setActiveSession = useChatStore((s) => s.setActiveSession);
  const settings = useAppStore((s) => s.settings);
  const { t } = useI18n();

  const handleNewChat = async (templateId?: string) => {
    const session = (await createSession(templateId)) as { id: string; initialPrompt?: string } | null;
    if (session) {
      setActiveSession(session.id);
      // For built-in templates, use i18n prompt; otherwise use stored prompt
      const builtInIds = ['general', 'code', 'writer', 'analyst'];
      const isBuiltIn = templateId && builtInIds.includes(templateId);
      const rawPrompt = isBuiltIn ? t(`settings.templates.builtin.${templateId}.prompt`) : session.initialPrompt;
      const prompt = rawPrompt === '(none)' ? '' : rawPrompt;
      if (prompt) {
        setTimeout(() => {
          window.api.sendMessage(session.id, prompt);
        }, 100);
      }
    }
  };

  const skills = settings?.chatTemplates || [];

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 bg-white dark:bg-[#131314]">
      <div className="mb-8">
        <GeminiIcon size={56} className="mx-auto mb-6" />
        <h1 className="text-3xl font-medium mb-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {t('welcome.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md text-base">{t('welcome.description')}</p>
      </div>

      {/* Skill grid — dynamic from settings */}
      <div className="grid grid-cols-2 gap-3 mb-6 max-w-lg w-full max-h-[240px] overflow-y-auto scrollbar-thin">
        {skills.map((skill) => (
          <button
            key={skill.id}
            onClick={() => handleNewChat(skill.id)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left"
          >
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={((skill as Record<string, unknown>).icon as string) || DEFAULT_ICON}
              />
            </svg>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {(skill as Record<string, unknown>).builtIn ? t(`welcome.template.${skill.id}`) : skill.name}
              </div>
              <div className="text-[10px] text-gray-400 truncate">
                {(skill as Record<string, unknown>).builtIn
                  ? t(`welcome.template.${skill.id}.desc`)
                  : ((skill as Record<string, unknown>).description as string) || ''}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => handleNewChat()}
        className="px-8 py-3 rounded-full bg-[#d3e3fd] dark:bg-[#004a77] text-[#001d35] dark:text-[#c2e7ff] font-medium hover:shadow-lg transition-all text-sm"
      >
        {t('welcome.newChat')}
      </button>
    </div>
  );
}

export default function App() {
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const initialized = useAppStore((s) => s.initialized);
  const setInitialized = useAppStore((s) => s.setInitialized);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const [settingsInitialTab, setSettingsInitialTab] = useState<string | undefined>(undefined);
  const { t } = useI18n();

  const { loadSettings } = useSettings();
  const { loadSessions } = useSessions();

  useTheme();

  useEffect(() => {
    const init = async () => {
      const settings = await loadSettings();
      await loadSessions();
      setInitialized(true);
      // Auto-open settings on API Key tab if no key configured
      if (!settings?.apiKey) {
        setSettingsInitialTab('api');
        setSettingsOpen(true);
      }
    };
    init();
  }, [loadSettings, loadSessions, setInitialized, setSettingsOpen]);

  const appListenersRegistered = useRef(false);
  useEffect(() => {
    if (appListenersRegistered.current) return;
    appListenersRegistered.current = true;

    const reloadSessions = async () => {
      const list = (await window.api.listSessions()) as import('../types/chat').SessionSummary[];
      useAppStore.getState().setSessions(list);
    };

    window.api.onOpenSettings(() => useAppStore.getState().setSettingsOpen(true));
    window.api.onNewChat(async () => {
      const session = await window.api.createSession();
      const s = session as { id: string };
      useChatStore.getState().setActiveSession(s.id);
      reloadSessions();
    });
    window.api.onSessionUpdated(() => {
      reloadSessions();
    });
  }, []);

  if (!initialized) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-[#131314]">
        <div className="flex items-center gap-3 text-gray-400">
          <GeminiIcon size={24} />
          <span>{t('app.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <UpdateBanner />
      <MainLayout>{activeSessionId ? <ChatView /> : <WelcomeScreen />}</MainLayout>
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setSettingsInitialTab(undefined);
        }}
        initialTab={settingsInitialTab as 'api' | undefined}
      />
      <ToolConfirmDialog />
    </>
  );
}
