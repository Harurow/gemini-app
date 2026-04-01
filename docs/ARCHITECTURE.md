# アーキテクチャ

## 3 層構造

```
┌──────────────────────────────────────────────────┐
│  Renderer (React / ブラウザ環境)                    │
│  - UI コンポーネント                                │
│  - Zustand ストア                                  │
│  - i18n (日本語/英語)                              │
│  - window.api 経由で Main と通信                    │
├──────────────────────────────────────────────────┤
│  Preload (contextBridge)                          │
│  - IPC チャネルの型安全な API を公開                  │
│  - Renderer から Main への唯一のアクセスポイント       │
├──────────────────────────────────────────────────┤
│  Main Process (Node.js)                           │
│  - Gemini API 通信 (gemini.service.ts)             │
│  - ツール実行 (tool-registry.ts)                    │
│  - MCP クライアント (mcp.service.ts)                │
│  - MCP サーバーホスト (mcp-server.service.ts)        │
│  - セッション永続化 (session.service.ts)             │
│  - 設定管理 (store.ts / electron-store)             │
└──────────────────────────────────────────────────┘
```

## ディレクトリ構成

```
src/
├── main/                    # Electron Main Process
│   ├── main.ts             # アプリエントリ、ウィンドウ管理
│   ├── ipc-handlers.ts     # 全 IPC ハンドラ登録
│   ├── menu.ts             # macOS ネイティブメニュー
│   ├── store.ts            # 設定永続化 (electron-store)
│   ├── services/
│   │   ├── gemini.service.ts   # Gemini API ラッパー (ストリーミング + ツールループ)
│   │   ├── mcp.service.ts          # MCP クライアント (stdio + HTTP)
│   │   ├── mcp-server.service.ts  # MCP サーバーホスト (ADR-018)
│   │   └── session.service.ts     # セッション CRUD (JSON ファイル)
│   └── tools/
│       ├── tool-registry.ts    # ツール登録・確認・ディスパッチ
│       ├── tool-types.ts       # 型定義
│       ├── read-file.tool.ts   # ファイル読み取り
│       ├── write-file.tool.ts  # ファイル書き込み (確認必要)
│       ├── edit-file.tool.ts   # ファイル部分編集 (確認必要)
│       ├── shell.tool.ts       # シェル実行 (確認必要)
│       ├── grep.tool.ts        # パターン検索
│       ├── glob.tool.ts        # ファイルグロブ
│       └── web-fetch.tool.ts   # URL コンテンツ取得
├── preload/
│   └── preload.ts          # contextBridge API 定義
└── renderer/                # React UI
    ├── App.tsx             # ルートコンポーネント
    ├── i18n/               # 国際化 (ja/en)
    ├── components/
    │   ├── chat/           # チャット UI
    │   ├── layout/         # レイアウト (Sidebar, Header)
    │   ├── settings/       # 設定モーダル
    │   └── common/         # 共通コンポーネント
    ├── hooks/              # カスタムフック
    ├── store/              # Zustand ストア
    └── types/              # TypeScript 型定義
```

## データフロー

### チャット送信
```
User Input → ChatInput.tsx
  → useChat.sendMessage()
    → window.api.sendMessage() [IPC invoke]
      → ipc-handlers.ts chat:send
        → gemini.service.ts sendMessage()
          → @google/genai SDK generateContentStream()
          → ストリーミングチャンク → IPC event → Renderer に表示
          → functionCall 検出 → tool-registry.ts execute()
            → (確認が必要なら) IPC で Renderer に確認要求
            → ツール実行 → 結果を API に返送 → 再生成ループ
```

### MCP サーバーホスト (ADR-018)
```
MCP Client (Claude Code 等)
  → HTTP POST http://127.0.0.1:3100/mcp
    → mcp-server.service.ts
      → tools/call: send_message
        → gemini.service.ts sendMessage()
        → session.service.ts appendMessages()
      → tools/call: create_session / list_sessions / get_session
        → session.service.ts
```

### セキュリティモデル (ADR-002)
- `contextIsolation: true` — Renderer から Node.js 直接アクセス不可
- `nodeIntegration: false` — Renderer で require 不可
- API Key は `safeStorage.encryptString()` で暗号化保存
- CSP: `script-src 'self'`
- シェル実行: タイムアウト 30s、出力 100KB 制限
- ツール確認: shell / write_file は実行前にユーザー承認

## ADR 一覧

| ADR | タイトル | 状態 |
|-----|---------|------|
| 001 | Electron フレームワーク選定 | Accepted |
| 002 | セキュリティモデル | Accepted |
| 003 | Gemini SDK 選定 | Accepted |
| 004 | MCP 統合 | Accepted |
| 005 | ツールシステム設計 | Accepted |
| 006 | ビルド時の問題と解決策 | Accepted |
| 007 | OAuth 認証 | Accepted |
| 008 | i18n リグレッション防止 | Accepted |
| 009 | OAuth の制限と API Key 主軸 | Accepted |
| 010 | エラーハンドリングポリシー | Accepted |
| 011 | Google Search + Function Calling 併用不可 | Accepted |
| 012 | web-fetch Electron 対応 | Accepted |
| 013 | Google Search 2段階方式 | Accepted |
| 014 | Gemini CLI パリティ | Accepted |
| 015 | Null Safety レビュー | Accepted |
| 016 | 入力バリデーション・サニタイゼーション | Accepted |
| 017 | 保存フィードバック統一 | Accepted |
| 018 | MCP サーバーホスト機能 | Accepted |
| 019 | import 漏れによる白画面の防止 | Accepted |
| 020 | IPC リスナー管理と removeAllListeners 禁止 | Accepted |
| 021 | IME 変換中の Enter 送信防止 | Accepted |
