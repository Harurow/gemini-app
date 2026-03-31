# ADR-005: ツールシステム設計

## Status: Accepted

## Context
Gemini CLI のツール機能（ファイル操作、シェル実行等）を GUI アプリに移植する。

## Decision
`ToolRegistry` パターンで統一管理。

## Built-in Tools
| ツール名 | 機能 | セキュリティ対策 |
|---------|------|----------------|
| `read_file` | ファイル読み取り | サイズ制限 (1MB) |
| `write_file` | ファイル書き込み | ディレクトリ自動作成 |
| `run_shell_command` | シェルコマンド実行 | タイムアウト (30s), 出力制限 (100KB) |
| `grep` | パターン検索 | 結果数制限 (50) |
| `glob` | ファイルグロブ | 結果数制限 (100) |

## Architecture
```
ToolRegistry
├── Built-in tools (Map<string, ToolDefinition>)
└── MCP tools (McpService.getTools() + execute delegate)
```

- `getDeclarations()`: ビルトイン + MCP の全ツール宣言を返す
- `execute(name, args)`: MCP プレフィックスで判別し、適切な実行パスにルーティング

## Agentic Tool Loop
1. ユーザーメッセージ + ツール宣言を Gemini API に送信
2. ストリーミングでテキスト + functionCall を受信
3. functionCall があれば ToolRegistry で実行
4. 結果を functionResponse として追加し、再度 API に送信
5. functionCall がなくなるまで繰り返し（最大 20 ループ）

## Consequences
- Google Search はネイティブ grounding として将来追加可能
- ツールの追加は `ToolDefinition` を実装して `ToolRegistry` に登録するだけ
