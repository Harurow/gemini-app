import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useI18n } from '../../i18n';
import { Spinner } from '../common/Spinner';

interface McpServerStatus {
  running: boolean;
  port: number;
  host: string;
  sessionCount: number;
}

export function McpServerSettings() {
  const { settings, updateSettings } = useSettings();
  const { t } = useI18n();
  const [status, setStatus] = useState<McpServerStatus>({
    running: false,
    port: 3100,
    host: '127.0.0.1',
    sessionCount: 0,
  });
  const [port, setPort] = useState('3100');
  const [host, setHost] = useState<'localhost' | 'lan'>('localhost');
  const [portError, setPortError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    loadStatus();
    if (settings?.mcpServerHost) {
      setPort(String(settings.mcpServerHost.port || 3100));
      setHost(settings.mcpServerHost.host || 'localhost');
    }
  }, [settings]);

  const loadStatus = async () => {
    const s = (await window.api.getMcpServerStatus()) as McpServerStatus;
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

  const save = async (overrides: Partial<{ enabled: boolean; port: number; host: 'localhost' | 'lan' }> = {}) => {
    const current = settings?.mcpServerHost;
    const newSettings = {
      enabled: overrides.enabled ?? current?.enabled ?? false,
      port: (overrides.port ?? Number(port)) || 3100,
      host: overrides.host ?? host,
    };
    await updateSettings({ mcpServerHost: newSettings });
    await loadStatus();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleToggle = async () => {
    const enabled = !settings?.mcpServerHost?.enabled;
    if (enabled && !validatePort(port)) return;

    setLoading(true);
    try {
      await save({ enabled });
    } finally {
      setLoading(false);
    }
  };

  const handlePortBlur = async () => {
    if (!validatePort(port)) return;
    await save({ port: Number(port) });
  };

  const handleHostChange = async (newHost: 'localhost' | 'lan') => {
    setHost(newHost);
    await save({ host: newHost });
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

      {/* Host selection */}
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
          {t('settings.mcpServer.hostLabel')}
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleHostChange('localhost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              host === 'localhost'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-500 hover:border-gray-400'
            }`}
          >
            localhost
          </button>
          <button
            onClick={() => handleHostChange('lan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              host === 'lan'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-500 hover:border-gray-400'
            }`}
          >
            LAN
          </button>
        </div>
        {host === 'lan' && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-start gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span>{t('settings.mcpServer.lanWarning')}</span>
          </p>
        )}
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
              {t('settings.mcpServer.endpoint')}: http://{status.host}:{status.port}/mcp
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
