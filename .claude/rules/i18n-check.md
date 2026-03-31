---
description: i18n リグレッション防止チェック (ADR-008)
paths:
  - "src/renderer/components/**/*.tsx"
---

## i18n ルール

- UI に表示する全文字列は `useI18n()` の `t()` 経由
- ハードコード英語文字列禁止 (例: `>Save<` → `>{t('settings.apiKey.save')}<`)
- 新しい文字列は `src/renderer/i18n/locales.ts` の **ja と en 両方** にキーを追加
- コンポーネント修正後に確認:
  - `useI18n` の import が残っているか
  - 既存の `t()` 呼び出しが維持されているか
  - ハードコード英語がないか (`grep '>A-Z'` でチェック)
