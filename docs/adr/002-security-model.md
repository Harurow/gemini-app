# ADR-002: セキュリティモデル

## Status: Accepted

## Context
Electron アプリはユーザーのファイルシステムとシェルにアクセスするため、セキュリティ境界が重要。

## Decision
以下のセキュリティ対策を実装:

### Electron セキュリティ設定
- `contextIsolation: true` — Renderer からの Main Process 直接アクセスを遮断
- `nodeIntegration: false` — Renderer での Node.js API 無効化
- `sandbox: false` — Main Process で child_process が必要なため（Renderer は sandbox）
- CSP: `script-src 'self'` のみ

### API Key 保管
- `safeStorage.encryptString()` で暗号化保存
- 平文でのディスク保存を防止

### IPC 通信
- `contextBridge.exposeInMainWorld()` で明示的な API のみ公開
- チャネル名のホワイトリスト方式

### シェル実行
- タイムアウト制限（デフォルト 30 秒、最大 120 秒）
- 出力サイズ制限（100KB）

### Electron Fuses
- `RunAsNode: false`
- `EnableCookieEncryption: true`
- `EnableNodeOptionsEnvironmentVariable: false`
- `OnlyLoadAppFromAsar: true`

## Consequences
- Renderer は `window.api` 経由でのみ Main と通信可能
- 全特権操作は Main Process で実行
