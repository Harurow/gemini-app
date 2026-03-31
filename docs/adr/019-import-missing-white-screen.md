# ADR-019: import 漏れによる白画面の発生と防止

## ステータス

Accepted

## コンテキスト

`App.tsx` に `useState` を追加した際、import 文に `useState` を追加し忘れた。
結果、Renderer がランタイムエラーで白画面になった。

TypeScript のコンパイル (`tsc --noEmit`) では検出されず、Vitest のテストも pass した。
OXLint も検出しなかった。これは React が `React.useState` ではなく名前付き import を前提としており、
ビルドツール (Vite) のトランスパイル時に初めてエラーとなるためである。

## 発生原因

1. `useState` を使うコードを追加
2. import 文に `useState` を追加し忘れた
3. 自己レビューで `npm start` によるビルド確認を**実施しなかった**

## 決定

### 変更後の自己レビュー手順 (強化)

1. **import 確認**: 新たに使用したフック・関数・型が import されているか目視確認
2. **ビルド確認**: `npm start` で実際に画面が表示されることを確認（白画面でないこと）
3. 既存の i18n / ADR / null safety チェックを継続

### 再発防止

- コンポーネントに新しいフック/関数を追加した場合、必ず import 文を確認する
- 白画面は Renderer のランタイムエラーを示す。DevTools のコンソールで原因を確認する

## 結果

- `App.tsx` に `useState` の import を追加して修正
- 自己レビュールールに「import 確認」を明記
