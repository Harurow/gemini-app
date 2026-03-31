# ADR-018: MCP サーバー機能

## ステータス

Accepted

## コンテキスト

外部の MCP クライアント（Claude Code、他のAIエージェント等）からこのアプリのチャット機能を利用できるようにしたい。HTTP 経由でテキスト・ファイル・画像・PDF を受け付け、Gemini API の応答を返す MCP サーバーを内蔵する。

## 決定

### Transport

- **Streamable HTTP** (`@modelcontextprotocol/sdk` v1.28.0) を採用
- 単一エンドポイント `/mcp` で POST/GET/DELETE を処理
- Node.js 標準 `http` モジュールで実装（Express 等の追加依存なし）

### セッション管理

- MCP プロトコルの `mcp-session-id` でクライアントセッションを管理
- MCP セッション ≠ アプリのチャットセッション（1:N の関係も可能）
- ツール引数で `sessionId` を指定してチャットセッションを操作

### 公開ツール

| ツール名 | 説明 |
|---------|------|
| `send_message` | テキスト・ファイル・画像を送信し AI 応答を取得 |
| `create_session` | 新規チャットセッションを作成 |
| `list_sessions` | セッション一覧を取得 |
| `get_session` | セッション詳細（メッセージ履歴）を取得 |

### 入力形式

- テキスト: `text` パラメータ (string)
- ファイル/画像/PDF: `attachments` パラメータ (配列: `{ base64, mimeType, name }`)
- MCP の content block (`image` type) も `send_message` の結果で返却可能

### 設定

- `mcpServerEnabled`: boolean (デフォルト: false)
- `mcpServerPort`: number (デフォルト: 3100)
- 設定 UI から有効化/無効化・ポート変更可能

### セキュリティ

- デフォルト無効。ユーザーが明示的に有効化する必要がある
- localhost (127.0.0.1) のみバインド。外部ネットワークからのアクセスを防止
- ツール確認ダイアログはサーバー経由では非対応（全ツール自動実行）
  - shell/write 等の危険なツールはサーバー経由では無効化
- API Key はサーバー経由では露出しない

## 結果

- 外部 AI エージェントからチャット機能を利用可能
- MCP クライアントのセッション管理とアプリのセッション管理は独立
- localhost 限定 + デフォルト無効でセキュリティリスクを最小化
