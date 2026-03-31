import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useI18n, type Locale } from '../../i18n';

export function ThemeSettings() {
  const { settings, updateSettings } = useSettings();
  const { t, locale, setLocale } = useI18n();
  const currentTheme = settings?.theme || 'system';

  const themes = [
    {
      id: 'system' as const,
      labelKey: 'settings.theme.system' as const,
      descKey: 'settings.theme.system.desc' as const,
    },
    { id: 'light' as const, labelKey: 'settings.theme.light' as const, descKey: 'settings.theme.light.desc' as const },
    { id: 'dark' as const, labelKey: 'settings.theme.dark' as const, descKey: 'settings.theme.dark.desc' as const },
  ];

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    await updateSettings({ theme });
  };

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <label className="block text-sm font-medium mb-2">{t('settings.theme.title')}</label>
        <div className="space-y-2">
          {themes.map((th) => (
            <label
              key={th.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                currentTheme === th.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={th.id}
                checked={currentTheme === th.id}
                onChange={() => handleThemeChange(th.id)}
                className="text-blue-600"
              />
              <div>
                <div className="text-sm font-medium">{t(th.labelKey)}</div>
                <div className="text-xs text-gray-500">{t(th.descKey)}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium mb-2">{t('settings.language.title')}</label>
        <div className="flex gap-2">
          {(['ja', 'en'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLocaleChange(lang)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                locale === lang
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              {t(`settings.language.${lang}` as const)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
