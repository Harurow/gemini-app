# ADR-006: ビルド時に発見された問題と解決策

## Status: Accepted

## Issue 1: bufferutil / utf-8-validate 未解決エラー

### Context
`@modelcontextprotocol/sdk` が依存する `ws` (WebSocket) パッケージが、オプション依存の `bufferutil` と `utf-8-validate` を要求。Vite がバンドル時にこれらを解決しようとしてエラー。

### Solution
1. `npm install bufferutil utf-8-validate` で明示的にインストール
2. `vite.main.config.ts` で `rollupOptions.external` に追加

## Issue 2: electron-store の ESM/CJS 互換性

### Context
`electron-store` v11 は ESM パッケージ。Vite + Electron の CJS 環境でバンドルされた際、`Store is not a constructor` エラーが発生。

### Solution
ESM/CJS インターポップ対応:
```typescript
const Store = (ElectronStore as unknown as { default: typeof ElectronStore }).default || ElectronStore;
```

## Issue 3: electron-store がパッケージ版で見つからない

### Context
`vite.main.config.ts` の `rollupOptions.external` に `electron-store` を追加していたため、
パッケージ版 (.app) では asar 内にバンドルされず `Cannot find module 'electron-store'` エラーが発生。

### Solution
`electron-store` を `rollupOptions.external` から削除。Vite にバンドルさせる。
ESM/CJS 互換性は Issue 2 のインターポップで対処済みなので、バンドルしても問題なし。

### 教訓
- `external` に追加するのは、ネイティブバイナリ（bufferutil 等）や Electron 自体など、
  実行環境側に存在するモジュールに限る
- 純 JS パッケージ（electron-store 等）は Vite にバンドルさせるのが安全

## Consequences
- これらの問題は Electron + Vite + ESM パッケージの組み合わせで頻出するパターン
- 新しいパッケージ追加時は ESM/CJS 互換性を必ず確認すること
- `rollupOptions.external` にはネイティブモジュールのみ追加すること
