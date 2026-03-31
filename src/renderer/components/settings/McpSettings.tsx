import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useI18n } from '../../i18n';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import type { McpServerConfig, McpStatus } from '../../types/settings';

export function McpSettings() {
  const { settings, updateSettings } = useSettings();
  const { t } = useI18n();
  const [configText, setConfigText] = useState('');
  const [status, setStatus] = useState<McpStatus[]>([]);
  const [restarting, setRestarting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (settings?.mcpServers) {
      setConfigText(JSON.stringify(settings.mcpServers, null, 2));
    }
    loadStatus();
  }, [settings]);

  const loadStatus = async () => {
    const s = (await window.api.getMcpStatus()) as McpStatus[];
    setStatus(s);
  };

  // Auto-save on blur
  const handleBlur = async () => {
    if (!configText.trim() || configText === '[]') {
      await updateSettings({ mcpServers: [] });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return;
    }
    try {
      const parsed = JSON.parse(configText) as McpServerConfig[];
      setParseError(null);
      await updateSettings({ mcpServers: parsed });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setParseError(t('settings.mcp.parseError'));
      setSaveStatus('error');
    }
  };

  const handleRestart = async () => {
    // Save first
    await handleBlur();
    setRestarting(true);
    const s = (await window.api.restartMcp()) as McpStatus[];
    setStatus(s);
    setRestarting(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('settings.mcp.title')}</label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('settings.mcp.description')}</p>
        <textarea
          value={configText}
          onChange={(e) => {
            setConfigText(e.target.value);
            setParseError(null);
            setSaveStatus('idle');
          }}
          onBlur={handleBlur}
          placeholder={`[\n  {\n    "name": "findata",\n    "type": "http",\n    "url": "http://192.168.0.20:3000/mcp"\n  }\n]`}
          rows={10}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2 mt-1 h-4">
          {parseError && <p className="text-xs text-red-500">{parseError}</p>}
          {saveStatus === 'saved' && <p className="text-xs text-green-600">{t('settings.saved')}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleBlur} size="sm">
          {t('settings.mcp.save')}
        </Button>
        <Button onClick={handleRestart} variant="secondary" size="sm" disabled={restarting}>
          {restarting ? (
            <>
              <Spinner size="sm" className="mr-1" /> {t('settings.mcp.restarting')}
            </>
          ) : (
            t('settings.mcp.restart')
          )}
        </Button>
      </div>

      {status.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">{t('settings.mcp.status')}</h3>
          <div className="space-y-1">
            {status.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${s.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-mono text-xs">{s.name}</span>
                <span className="text-gray-500 text-xs">
                  {s.status === 'connected' ? t('settings.mcp.tools', { n: s.toolCount }) : s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
