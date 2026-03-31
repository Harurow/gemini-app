import { describe, it, expect } from 'vitest';
import { locales } from '../renderer/i18n/locales';

describe('i18n locales', () => {
  const jaKeys = Object.keys(locales.ja);
  const enKeys = Object.keys(locales.en);

  it('ja and en have the same number of keys', () => {
    expect(jaKeys.length).toBe(enKeys.length);
  });

  it('all ja keys exist in en', () => {
    const missingInEn = jaKeys.filter((k) => !enKeys.includes(k));
    expect(missingInEn).toEqual([]);
  });

  it('all en keys exist in ja', () => {
    const missingInJa = enKeys.filter((k) => !jaKeys.includes(k));
    expect(missingInJa).toEqual([]);
  });

  it('no empty values in ja', () => {
    const emptyKeys = jaKeys.filter((k) => !(locales.ja as Record<string, string>)[k]);
    expect(emptyKeys).toEqual([]);
  });

  it('no empty values in en', () => {
    const emptyKeys = enKeys.filter((k) => !(locales.en as Record<string, string>)[k]);
    expect(emptyKeys).toEqual([]);
  });
});
