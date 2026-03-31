---
description: コミット前チェックルール
---

## コミット前チェックリスト

1. `npm start` で起動確認（ビルドエラーがないこと）
2. ADR との整合性確認（新しい技術選定がADRに記録されているか）
3. セキュリティチェック:
   - API キーがハードコードされていないこと
   - `nodeIntegration: true` が追加されていないこと
   - `contextIsolation: false` が追加されていないこと
4. 非推奨 API/パッケージの使用がないこと
5. コミットメッセージ: 日本語 + type prefix (`feat:`, `fix:`, etc.)
