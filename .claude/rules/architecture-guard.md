---
description: アーキテクチャ制約の検証ルール
---

## Electron セキュリティ制約 (ADR-002)

- Renderer から Node.js API を直接呼び出してはならない
- 新しい IPC チャネルは `src/preload/preload.ts` に型定義を追加すること
- `nodeIntegration: true` にしてはならない
- `contextIsolation: false` にしてはならない

## レイヤー分離

- `src/renderer/` から `src/main/` を直接 import してはならない
- Main → Renderer の通信は `webContents.send()` のみ
- Renderer → Main の通信は `ipcRenderer.invoke()` のみ

## 依存方向

```
renderer → (preload) → main → services/tools
                                  ↓
                              外部API (Gemini, MCP)
```
