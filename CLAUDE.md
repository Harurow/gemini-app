# Gemini Desktop App

Electron + React + TypeScript の macOS デスクトップチャットアプリ。Google Gemini API + MCP Server 対応。

## ビルド・実行

- `npm start` — 開発サーバー (HMR あり。Main 変更時は `rs` + Enter)
- `npm run make` — macOS .app パッケージング
- `npm test` — テスト実行
- `npm run test:coverage` — カバレッジ付きテスト
- `npm run lint` — OXLint
- `npm run format` — Prettier

## 開発ワークフロー (必須)

1. **バックログ確認**: `docs/backlog.md` に作業内容があること。なければ追加してから着手
2. **優先度順**: 高→中→低の順に進捗
3. **実装後レビュー**: ADR整合性、i18n、null safety、ハードコード英語チェック
4. **テスト作成**: 新機能・修正には対応テストを書く。カバレッジ 80% 以上維持
5. **Lint/Format**: pre-commit hook (OXLint + Prettier) で自動実行
6. **ドキュメント同期**: README.md と README.en.md はセットで更新。docs/ 内は常に最新・矛盾なし
7. **バックログ更新**: 作業完了後・セッション終了前に `docs/backlog.md` を最新化
8. **不具合・矛盾発見時**: バックログに即記載 (Linter エラー等の軽微な修正は即対応可)

## アーキテクチャ

- `src/main/` — Electron Main Process。全特権操作はここで実行
- `src/preload/` — IPC Bridge。`window.api` の型定義と実装
- `src/renderer/` — React UI。ブラウザ環境、Main への直接アクセス不可
- 詳細: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## i18n (ADR-008)

- UI の全文字列は `t()` 経由。ハードコード英語禁止
- `src/renderer/i18n/locales.ts` の ja/en 両方に追加
- 修正後に `grep '>A-Z'` でチェック

## セキュリティ (ADR-002)

- `contextIsolation: true`, `nodeIntegration: false`
- API Key: `safeStorage.encryptString()` で暗号化
- shell/write/edit ツール: 実行前にユーザー確認

## Null Safety (ADR-015)

- フィールド名・型変更時は既存データのマイグレーション必須
- `?.` と `|| ''` で null safe に。`.slice()` 等の対象が undefined でないか確認

## コード規約

- 2スペース、strict TypeScript、関数コンポーネント + hooks + Zustand + Tailwind
- コンポーネント修正は Edit (部分変更) を優先

## コミット

- type prefix: `feat:`, `fix:`, `docs:`, `refactor:`, `config:`, `chore:`
- 日本語、論理的な単位で分割。pre-commit hook を必ず通す

## ドキュメント

- ADR: `docs/adr/` — 設計判断記録。レビュー前に確認。不具合は ADR に記録
- バックログ: `docs/backlog.md` — 常に最新
- ハーネス: `docs/harness-engineering-best-practices.md` に従う
