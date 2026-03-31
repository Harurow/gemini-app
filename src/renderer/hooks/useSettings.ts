import { useCallback } from 'react';
import { useAppStore } from '../store/app-store';
import type { AppSettings } from '../types/settings';

export function useSettings() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);

  const loadSettings = useCallback(async () => {
    const s = (await window.api.getSettings()) as AppSettings;
    setSettings(s);
    return s;
  }, [setSettings]);

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      const updated = (await window.api.updateSettings(partial as Record<string, unknown>)) as AppSettings;
      setSettings(updated);
      return updated;
    },
    [setSettings],
  );

  const validateApiKey = useCallback(async (key: string) => {
    return window.api.validateApiKey(key);
  }, []);

  return { settings, loadSettings, updateSettings, validateApiKey };
}
