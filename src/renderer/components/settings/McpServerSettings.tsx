import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useI18n } from '../../i18n';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';

interface McpServerStatus {
  running: boolean;
  port: number;
  sessionCount: number;
}

export function McpServerSettings() {
  const { settings, updateSettings } = useSettings();
  const { t } = useI18n();
  const [status, setStatus] = useState<McpServerStatus>({ running: false, port: 3100, sessionCount: 0 });
  const [port, setPort] = useState('3100');
  const [portError, setPortError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    loadStatus();
    if (settings?.mcpServerHost) {
      setPort(String(settings.mcpServerHost.port || 3100));
    }
  }, [settings]);

  const loadStatus = async () => {
    const s = await window.api.getMcpServerStatus();
    setStatus(s);
  };

  const validatePort = (value: string): boolean => {
    const num = Number(value);
    if (Number.isNaN(num) || num < 1024 || num > 65535) {
      setPortError(t('settings.mcpServer.portError'));
      return false;
    }
    setPortError(null);
    return true;
  };

  const handleToggle = async () => {
    const enabled = !settings?.mcpServerHost?.enabled;
    const portNum = Number(port) || 3100;

    if (enabled && !validatePort(port)) return;

    setLoading(true);
    try {
      await updateSettings({ mcpServerHost: { enabled, port: portNum } });
      await loadStatus();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handlePortBlur = async () => {
    if (!validatePort(port)) return;
    const portNum = Number(port);
    const enabled = settings?.mcpServerHost?.enabled ?? false;
    await updateSettings({ mcpServerHost: { enabled, port: portNum } });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const isEnabled = settings?.mcpServerHost?.enabled ?? false;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('settings.mcpServer.title')}</label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('settings.mcpServer.description')}</p>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm">{t('settings.mcpServer.enabled')}</span>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          {loading ? (
            <Spinner size="sm" className="absolute left-1/2 -translate-x-1/2" />
          ) : (
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          )}
        </button>
      </div>

      {/* Port */}
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
          {t('settings.mcpServer.port')}
        </label>
        <input
          type="number"
          value={port}
          onChange={(e) => {
            setPort(e.target.value);
            setPortError(null);
          }}
          onBlur={handlePortBlur}
          min={1024}
          max={65535}
          className="w-32 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {portError && <p className="text-xs text-red-500 mt-1">{portError}</p>}
        {saveStatus === 'saved' && <p className="text-xs text-green-600 mt-1">{t('settings.saved')}</p>}
      </div>

      {/* Status */}
      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status.running ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium">
            {status.running ? t('settings.mcpServer.running') : t('settings.mcpServer.stopped')}
          </span>
        </div>

        {status.running && (
          <>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {t('settings.mcpServer.endpoint')}: http://127.0.0.1:{status.port}/mcp
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('settings.mcpServer.sessions', { n: status.sessionCount })}
            </div>
          </>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500">{t('settings.mcpServer.tools')}</p>
      </div>
    </div>
  );
}
