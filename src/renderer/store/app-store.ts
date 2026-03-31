import { create } from 'zustand';
import type { SessionSummary } from '../types/chat';
import type { AppSettings } from '../types/settings';

interface AppState {
  sessions: SessionSummary[];
  settings: AppSettings | null;
  settingsOpen: boolean;
  sidebarOpen: boolean;
  initialized: boolean;

  setSessions: (sessions: SessionSummary[]) => void;
  addSession: (session: SessionSummary) => void;
  removeSession: (id: string) => void;
  setSettings: (settings: AppSettings) => void;
  setSettingsOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sessions: [],
  settings: null,
  settingsOpen: false,
  sidebarOpen: true,
  initialized: false,

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((s) => ({
      sessions: [session, ...s.sessions],
    })),

  removeSession: (id) =>
    set((s) => ({
      sessions: s.sessions.filter((sess) => sess.id !== id),
    })),

  setSettings: (settings) => set({ settings }),

  setSettingsOpen: (open) => set({ settingsOpen: open }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setInitialized: (initialized) => set({ initialized }),
}));
