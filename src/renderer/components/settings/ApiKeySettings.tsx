import React, { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useI18n } from '../../i18n';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { sanitize } from '../../utils/validation';

export function ApiKeySettings() {
  const { settings, updateSettings, validateApiKey } = useSettings();
  const { t } = useI18n();
  const [key, setKey] = useState(settings?.apiKey || '');
  const [validating, setValidating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid' | 'saved'>('idle');

  const handleSave = async () => {
    const sanitized = sanitize(key);
    await updateSettings({ apiKey: sanitized });
    setKey(sanitized);
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleValidate = async () => {
    if (!key.trim()) return;
    setValidating(true);
    await updateSettings({ apiKey: key });
    const valid = await validateApiKey(key);
    setStatus(valid ? 'valid' : 'invalid');
    setValidating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-sm font-medium">{t('settings.apiKey.title')}</label>
          {settings?.apiKey && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              {t('settings.apiKey.active')}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('settings.apiKey.description')}</p>
        <p className="text-xs text-blue-500 dark:text-blue-400 mb-3">{t('settings.apiKey.howTo')}</p>
        <input
          type="password"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setStatus('idle');
          }}
          placeholder={t('settings.apiKey.placeholder')}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} size="sm">
          {t('settings.apiKey.save')}
        </Button>
        <Button onClick={handleValidate} variant="secondary" size="sm" disabled={validating || !key.trim()}>
          {validating ? (
            <>
              <Spinner size="sm" className="mr-1" /> {t('settings.apiKey.validating')}
            </>
          ) : (
            t('settings.apiKey.validate')
          )}
        </Button>
        {status === 'saved' && <span className="text-xs text-green-600">{t('settings.saved')}</span>}
        {status === 'valid' && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('settings.apiKey.valid')}
          </span>
        )}
        {status === 'invalid' && (
          <span className="flex items-center gap-1 text-sm text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('settings.apiKey.invalid')}
          </span>
        )}
      </div>
    </div>
  );
}
