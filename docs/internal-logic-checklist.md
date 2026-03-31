# 内部ロジック検証チェックリスト

Gemini CLI の主要ロジックと本アプリの実装状態を比較。

## ストリーミング + ツールループ

| ロジック | Gemini CLI | 本アプリ | 状態 |
|---------|-----------|---------|------|
| API 呼び出し | generateContent (非ストリーミング) | 同じ (ADR-014) | OK |
| thought_signature 保持 | レスポンス Content をそのまま使用 | 同じ | OK |
| functionCall 検出 | response.candidates[0].content.parts | 同じ | OK |
| ツール実行→結果→再生成ループ | 最大ループ制限あり | maxLoops=20 | OK |
| AbortController でキャンセル | あり | あり | OK |
| モデルフォールバック | なし | あり (本アプリ独自) | OK |
| リトライ (指数バックオフ) | 4回 | **未実装** | TODO #1 |
| トークンカウント | あり | usageMetadata で取得・表示 | OK |

## ツール実行

| ロジック | Gemini CLI | 本アプリ | 状態 |
|---------|-----------|---------|------|
| read_file | fs.readFile + 行範囲 | 同じ | OK |
| write_file | fs.writeFile + ディレクトリ自動作成 | 同じ | OK |
| edit_file | 文字列置換 (一意性チェック) | 同じ | OK |
| shell | child_process.exec + タイムアウト | 同じ | OK |
| grep | ripgrep or grep | grep コマンド | OK |
| glob | glob パッケージ | find コマンド | OK |
| web_fetch | fetch | Electron net.fetch (ADR-012) | OK |
| google_web_search | 別 API コールで googleSearch grounding | 同じ (ADR-013) | OK |
| ツール確認ダイアログ | PolicyEngine | IPC confirm dialog | OK |
| サンドボックス実行 | Docker | **未実装** | TODO #6 |

## MCP 連携

| ロジック | Gemini CLI | 本アプリ | 状態 |
|---------|-----------|---------|------|
| stdio トランスポート | StdioClientTransport | 同じ | OK |
| HTTP トランスポート | StreamableHTTPClientTransport | 同じ | OK |
| ツール発見 (listTools) | あり | あり | OK |
| スキーマ変換 (JSON Schema → Gemini) | あり | あり | OK |
| ツール実行 (callTool) | あり | あり | OK |
| リソース/プロンプト取得 | あり | **未実装** | TODO #7 |

## セッション管理

| ロジック | Gemini CLI | 本アプリ | 状態 |
|---------|-----------|---------|------|
| 会話履歴の永続化 | JSON ファイル | 同じ | OK |
| タイトル自動生成 | 最初のメッセージから | 同じ | OK |
| チャット圧縮 (要約) | ChatCompressionService | **未実装** | TODO #2 |
