# ADR-004: MCP (Model Context Protocol) 統合

## Status: Accepted

## Context
MCP サーバーとの連携で外部ツール（GitHub, DB 等）を利用可能にする。

## Decision
`@modelcontextprotocol/sdk` (公式 TypeScript SDK) を採用し、Main Process で MCP クライアントを管理。

## Design
- `McpService` クラスが複数の MCP サーバー接続を管理
- 現在は `StdioClientTransport` のみサポート（stdio ベースのサーバー）
- MCP ツールスキーマ (JSON Schema) → Gemini `FunctionDeclaration` に変換
- ツール名は `mcp_{serverName}_{toolName}` でネームスペース化
- `ToolRegistry` に統合し、ビルトインツールと透過的に扱う

## Configuration
設定は `settings.json` に保存:
```json
[{
  "name": "server-name",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
  "enabled": true
}]
```

## Consequences
- MCP サーバーは子プロセスとして起動（アプリ終了時にクリーンアップ必要）
- HTTP トランスポートは将来拡張として残す
