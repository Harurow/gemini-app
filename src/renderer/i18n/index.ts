import { create } from 'zustand';
import { locales, type Locale, type TranslationKey } from './locales';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

function detectLocale(): Locale {
  // Check localStorage first (persisted preference)
  try {
    const saved = localStorage.getItem('gemini-locale');
    if (saved === 'ja' || saved === 'en') return saved;
  } catch {
    // Ignore
  }
  // Fall back to browser language
  const lang = navigator.language;
  if (lang.startsWith('ja')) return 'ja';
  return 'en';
}

export const useI18n = create<I18nState>((set, get) => ({
  locale: detectLocale(),

  setLocale: (locale) => {
    try {
      localStorage.setItem('gemini-locale', locale);
    } catch {
      // Ignore
    }
    set({ locale });
  },

  t: (key, params) => {
    const { locale } = get();
    const k = key as TranslationKey;
    let text = locales[locale]?.[k] || locales['en']?.[k] || key;
    if (params) {
      for (const [pk, pv] of Object.entries(params)) {
        text = text.replace(`{${pk}}`, String(pv));
      }
    }
    return text;
  },
}));

export type { Locale, TranslationKey };
