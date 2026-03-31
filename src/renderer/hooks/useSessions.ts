import { useCallback } from 'react';
import { useAppStore } from '../store/app-store';
import type { SessionSummary } from '../types/chat';

export function useSessions() {
  const sessions = useAppStore((s) => s.sessions);
  const setSessions = useAppStore((s) => s.setSessions);
  const addSession = useAppStore((s) => s.addSession);
  const removeSession = useAppStore((s) => s.removeSession);

  const loadSessions = useCallback(async () => {
    const list = (await window.api.listSessions()) as SessionSummary[];
    setSessions(list);
    return list;
  }, [setSessions]);

  const createSession = useCallback(async () => {
    const session = (await window.api.createSession()) as SessionSummary & { id: string };
    addSession({
      id: session.id,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: '',
      messageCount: 0,
    });
    return session;
  }, [addSession]);

  const deleteSession = useCallback(
    async (id: string) => {
      await window.api.deleteSession(id);
      removeSession(id);
    },
    [removeSession],
  );

  return { sessions, loadSessions, createSession, deleteSession };
}
