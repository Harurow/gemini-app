---
description: テストルール。src/ 配下のファイルを変更した時に適用。
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

## テストポリシー

- 新しいサービス/ツールには対応する `*.test.ts` を作成
- テストファイルは `src/__tests__/` に配置
- テストフレームワーク: Vitest
- テスト実行: `npm test`

## テスト対象 (優先度順)

1. **ツール** (`src/main/tools/`): 入出力の検証、エラーケース
2. **サービス** (`src/main/services/`): モック使用、正常系・異常系
3. **ストア** (`src/renderer/store/`): 状態遷移の検証
4. **i18n** (`src/renderer/i18n/`): 全キーが ja/en 両方にあるか
