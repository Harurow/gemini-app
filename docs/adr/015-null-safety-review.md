# ADR-015: Null Safety とデータマイグレーションのレビュー義務化

## Status: Accepted

## Context
`PromptTemplate.systemInstruction` → `prompt` にフィールド名を変更した際、
既存の保存データ（electron-store）は旧フィールド名のまま残っていた。
`tp.prompt` が `undefined` の状態で `.slice()` を呼びクラッシュ（白画面）。

同様の問題が過去にも発生:
- Session の初期タイトル `'New Chat'` vs `''` の不一致
- OAuth 削除後の IPC チャネル不整合

## Decision
以下のルールを追加:

### フィールド名・型の変更時
1. **既存データのマイグレーション処理**を必ず書く
2. 旧フィールドからの読み込みフォールバックを入れる
3. `?.` (optional chaining) と `|| ''` (デフォルト値) を徹底する

### コードレビューチェック項目
- [ ] `undefined` / `null` になり得る箇所に `.` でアクセスしていないか
- [ ] `electron-store` のデータ構造変更時にマイグレーションがあるか
- [ ] 新フィールド追加時に `defaults` にデフォルト値があるか
- [ ] 配列の `.map()` / `.slice()` の対象が `undefined` でないか

## Consequences
- データ構造変更時のクラッシュを防止
- 古いバージョンの設定ファイルでも新バージョンが起動可能
