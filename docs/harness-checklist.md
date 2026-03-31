# ハーネスエンジニアリング準拠チェック

最終確認日: 2026-03-30

## セットアップ

- [x] CLAUDE.md は 200 行以下 → **53 行**
- [x] `.claude/rules/` で関心事を分離 → **6 ファイル**
  - `architecture-guard.md` — レイヤー分離、セキュリティ制約
  - `commit-review.md` — コミット前チェック
  - `i18n-check.md` — 翻訳リグレッション防止 (パス指定: `src/renderer/components/**/*.tsx`)
  - `self-review.md` — 変更後の自己レビュー
  - `testing.md` — テストポリシー (パス指定: `src/**/*.ts`)
  - `usability.md` — UX ルール (パス指定: `src/renderer/components/**/*.tsx`)
- [x] MEMORY.md のインデックスは 200 行以内 → **6 行**
- [x] ADR で重要な決定を記録 → **12 件**
- [x] バックログ管理 → `docs/backlog.md` + `docs/internal-logic-checklist.md`

## 品質

- [x] 単体テスト → **17 テスト合格** (ツール 12 + i18n 5)
- [x] ハードコード英語なし → grep で確認済み
- [x] i18n 全キーが ja/en 両方に存在 → テストで確認済み
- [x] エラーハンドリングポリシー → ADR-010
- [x] セキュリティモデル → ADR-002

## ドキュメント

- [x] README.md — セットアップ、機能、技術スタック
- [x] ARCHITECTURE.md — 3 層構造、ディレクトリ、データフロー
- [x] CLAUDE.md — 開発ルール、コンテキスト効率化
- [x] docs/adr/ — 設計判断 12 件
- [x] docs/backlog.md — 移植状況
- [x] docs/internal-logic-checklist.md — Gemini CLI 比較
- [x] docs/harness-checklist.md — 本ドキュメント

## メモリ

- [x] feedback_development_rules.md — 開発プロセスルール
- [x] feedback_i18n_regression.md — i18n リグレッション防止
- [x] feedback_component_edit.md — Edit 部分変更優先
- [x] feedback_settings_ux.md — 設定 UX 保護
- [x] project_gemini_app.md — プロジェクト概要
- [x] reference_harness_engineering.md — ベストプラクティス参照

## 改善が必要な項目

| 項目 | 状態 | 次のアクション |
|------|------|---------------|
| チャットテンプレート機能 | 未実装 | #18 |
| AI モデルフォールバック | 未実装 | #19 |
| レポート出力 (PDF) | 未実装 | バックログ |
| チャット圧縮 | 未実装 | バックログ |
| リトライ (指数バックオフ) | 未実装 | バックログ |
