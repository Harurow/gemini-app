---
description: Null Safety とデータマイグレーション (ADR-015)
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

## フィールド名・型の変更時 (必須)

1. **既存データのマイグレーション処理**を書く（electron-store の旧フィールドからの読み込み）
2. 旧フィールドのフォールバック: `tp.prompt || tp.systemInstruction || ''`
3. `?.` (optional chaining) と `|| ''` / `|| []` を徹底

## レビューチェック

- `undefined` / `null` になり得る箇所に `.` でアクセスしていないか
- `.slice()` / `.map()` / `.length` の対象が配列/文字列であることを保証しているか
- `electron-store` のデータ構造変更時にマイグレーションがあるか
