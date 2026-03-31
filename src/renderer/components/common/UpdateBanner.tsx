import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';

interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  releaseUrl?: string;
  releaseName?: string;
}

export function UpdateBanner() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    // Check after a short delay to not block app startup
    const timer = setTimeout(async () => {
      try {
        const result = await window.api.checkForUpdate();
        if (result.hasUpdate) {
          setUpdate(result);
        }
      } catch {
        // Silently ignore update check failures
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!update || dismissed) return null;

  const handleOpen = () => {
    if (update.releaseUrl) {
      window.open(update.releaseUrl, '_blank');
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 text-sm">
      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      <span className="flex-1 text-blue-700 dark:text-blue-300">
        {t('update.available', { version: update.latestVersion || '' })}
      </span>
      <button
        onClick={handleOpen}
        className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
      >
        {t('update.download')}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
