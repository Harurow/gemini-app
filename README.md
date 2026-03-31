# Gemini Desktop

> **Note:** このアプリは Google が Gemini の公式デスクトップアプリをリリースするまでの繋ぎとして開発されています。公式アプリが公開された場合、本プロジェクトの役割は終了します。

Google Gemini API を使用した macOS デスクトップチャットアプリ。[Gemini CLI](https://github.com/google-gemini/gemini-cli) の主要機能を GUI で提供。

[English README](./README.en.md)

## 機能

- テキストチャット（ストリーミング応答）
- マルチモーダル入力（画像/PDF の添付、D&D、ペースト対応）
- Google Search grounding（リアルタイム Web 検索）
- ビルトインツール（ファイル操作、シェル実行、grep、glob）
- MCP サーバー連携（stdio / HTTP）
- MCP サーバーホスト（外部 AI エージェントからチャット利用可能）
- ツール実行確認ダイアログ（シェルコマンド、ファイル書き込み）
- セッション管理（作成/切替/削除/タイトル自動生成）
- ダーク/ライトテーマ（システム連動）
- 日本語/英語 UI

## インストール

1. [Releases](https://github.com/Harurow/gemini-app/releases) から ZIP をダウンロード
2. ZIP を展開し、`Gemini Desktop.app` を Applications にドラッグ
3. **初回のみ**: ターミナルで以下を実行（コード署名なしのため macOS Gatekeeper を解除）
   ```bash
   xattr -cr "/Applications/Gemini Desktop.app"
   ```
4. アプリを起動

## 開発

```bash
npm install   # 依存パッケージインストール
npm start     # 開発サーバー起動
npm run make  # macOS .app パッケージング
```

## API キー

1. [Google AI Studio](https://aistudio.google.com) にアクセス
2. 「API キーを作成」をクリック
3. アプリの設定画面 (Cmd+,) でキーを貼り付けて保存

## MCP サーバー設定

設定 > MCP サーバー タブで JSON 形式で設定:

```json
[
  {
    "name": "findata",
    "type": "http",
    "url": "http://192.168.0.20:3000/mcp"
  },
  {
    "name": "filesystem",
    "transport": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
  }
]
```

## MCP サーバーホスト (実験的)

設定 > MCP ホスト タブで有効化すると、このアプリが MCP サーバーとして動作します。
外部の MCP クライアント (Claude Code 等) からチャット機能を HTTP 経由で利用できます。

- エンドポイント: `http://127.0.0.1:3100/mcp` (ポート変更可)
- localhost のみ。デフォルト無効
- 公開ツール: `send_message`, `create_session`, `list_sessions`, `get_session`

Claude Code の設定例:

```json
{
  "mcpServers": {
    "gemini-desktop": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:3100/mcp"
    }
  }
}
```

## 技術スタック

| カテゴリ     | 技術                                      |
| ------------ | ----------------------------------------- |
| デスクトップ | Electron + Electron Forge + Vite          |
| UI           | React 19 + TypeScript                     |
| スタイル     | Tailwind CSS v3                           |
| 状態管理     | Zustand                                   |
| AI SDK       | @google/genai                             |
| MCP          | @modelcontextprotocol/sdk                 |
| Markdown     | react-markdown + react-syntax-highlighter |

## ドキュメント

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — アーキテクチャ詳細
- [docs/feature-comparison.md](./docs/feature-comparison.md) — Gemini CLI との機能比較
- [docs/adr/](./docs/adr/) — 設計判断記録 (ADR)
- [docs/backlog.md](./docs/backlog.md) — 機能移植状況とバックログ

## ライセンス

Apache License 2.0 — [Google Gemini CLI](https://github.com/google-gemini/gemini-cli) の派生作品として同一ライセンスを適用。詳細は [LICENSE](./LICENSE) と [NOTICE](./NOTICE) を参照。

## Author

[Harurow](https://github.com/Harurow)
