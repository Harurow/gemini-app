# バックログ

## 移植済み機能

| 機能 | 備考 |
|------|------|
| テキストチャット | 非ストリーミング (thought_signature 対応, ADR-014) |
| マルチモーダル入力 | 画像/PDF/テキスト/Markdown/コード添付 (D&D, ペースト対応) |
| Google Search grounding | google_web_search ツール (別 API コール, ADR-013) |
| ツール: read_file | ファイル読み取り (行範囲指定) |
| ツール: write_file | ファイル書き込み (確認ダイアログ) |
| ツール: edit_file | ファイル部分編集 (確認ダイアログ) |
| ツール: run_shell_command | シェル実行 (確認ダイアログ, タイムアウト 30s) |
| ツール: grep | パターン検索 |
| ツール: glob | ファイルグロブ |
| ツール: web_fetch | URL コンテンツ取得 (Electron net.fetch) |
| ツール: google_web_search | 別 API コールで Google Search grounding |
| ツール: create_skill | AI がスキルを作成 |
| MCP サーバー | stdio + HTTP トランスポート |
| セッション管理 | 作成/切替/削除/タイトル自動生成 |
| API Key 認証 | safeStorage 暗号化保存 |
| モデル選択 | Gemini 3.x Preview + 2.5 Stable (デフォルト: gemini-3-flash-preview) |
| モデルフォールバック | 429 レート制限時に下位モデルへ自動降格 |
| リトライ | 最大4回、指数バックオフ + ジッター |
| チャット圧縮 | 50メッセージ超で自動要約 |
| System Instruction | モデルタブでカスタム指示 |
| プロンプトテンプレート | チャット開始時の定型プロンプト (設定で管理, i18n 対応) |
| スキルシステム | /スキルID で自動化ワークフロー実行 (4組み込み + AI/ユーザー作成) |
| ダーク/ライトテーマ | システム連動 + 手動切替 |
| 日本語/英語 UI | 自動検出 + 手動切替 |
| トークン使用量表示 | API 呼び出し回数 + 入出力トークン |
| ツール確認ダイアログ | shell/write/edit 実行前にユーザー承認 |
| Escape キーでキャンセル | ストリーミング/スキル実行中 |
| 多重起動防止 | requestSingleInstanceLock |
| macOS パッケージング | .app 生成 |
| 入力バリデーション | sanitize + maxLength + 必須チェック (ADR-016) |
| 保存フィードバック統一 | 全タブで「保存しました」表示 (ADR-017) |
| OXLint + Prettier | pre-commit hook で自動実行 |
| MCP サーバーホスト | HTTP Streamable Transport で外部 AI エージェントからチャット利用可 (ADR-018) |
| テストカバレッジ 86% | vitest + @vitest/coverage-v8 |
| GitHub Actions CI | lint → format check → test → coverage → build |
| Issue Template | Bug Report + Feature Request |
| 更新通知 | 起動時に GitHub Releases をチェック→バナー表示→ダウンロードページへ |
| 英語 README | README.en.md |

## TODO（優先度順）

### 高

| # | 機能 | 説明 |
|---|------|------|
| 1 | Plan Mode | 読み取り専用で計画立案→プレビュー→承認→実装。GUI ならタイムライン UI で直感的 |
| 2 | @ ファイル参照 | 入力欄で `@` 入力→ファイルピッカー→内容をプロンプトに注入。read_many_files 連動 |
| 3 | Rewind / Restore | 会話の巻き戻し + ファイル状態復元。GUI ならタイムラインで操作 |
| 4 | 画面クリア / コピー | チャット画面のクリアボタン、最後の応答をクリップボードにコピーするボタン |
| 5 | 承認モード切替 | default (毎回確認) / auto_edit (編集のみ自動) / yolo (全自動) を設定で選択 |
| 6 | セッション共有・エクスポート | Markdown / JSON 形式で会話をエクスポート |
| 7 | スラッシュコマンドのオートコンプリート | 入力欄で `/` を入力したらスキル候補をドロップダウン表示 |
| 8 | 送信後メッセージが残る問題の確認 | key={sendCount} で対応済みだが再発報告あり。要確認 |

### 中

| # | 機能 | 説明 |
|---|------|------|
| 9 | レポート出力 (PDF) | 分析結果を帳票形式で出力。実行前にユーザー確認 |
| 10 | 画像生成 | Gemini 3.x の画像生成モデル対応 |
| 11 | list_directory ツール | ディレクトリ一覧ツール。@ 参照と連動 |
| 12 | セッション検索・タグ | セッション一覧のフィルタリング・タグ付け |
| 13 | フォルダ信頼管理 | 作業ディレクトリの信頼レベル設定 |
| 14 | サンドボックス実行 | Docker 内でのシェルコマンド実行 |
| 15 | ワークディレクトリ変更機能 | Header のパス表示をクリックして作業ディレクトリを変更 |
| 16 | 自動更新 (署名後) | 将来コード署名導入後に electron-updater で自動適用に移行 |
| 17 | 音声入力 (Gemini 文字起こし) | Push-to-talk 方式。マイク長押し→録音→離す→Gemini API で文字起こし→テキスト挿入。仕様: MediaRecorder で録音、AudioContext+AnalyserNode で波形表示、無音検出でスキップ、macOS マイク権限。旧 Web Speech API は不安定のため不採用 |

### 低

| # | 機能 | 説明 |
|---|------|------|
| 18 | MCP リソース/プロンプト | 完全な MCP プロトコル対応 |
| 19 | ブラウザ操作 | Playwright でのブラウザ自動操作 |
| 20 | A2A サーバー | エージェント間通信 (実験的) |

### 既知の不具合・改善要望

| 問題 | 状態 | 備考 |
|------|------|------|
| スキル二重送信 | 修正済み (stream-finalize) | 再発しないか要監視 |
| アプリアイコンが dev モードで変わらない | 部分修正 | dock.setIcon で対応済み。キャッシュ問題あり |
| oauth.service.ts 削除済み | 対応済み | ADR-009 で不要判定。シークレット含有のため削除 |

## 不要と判断

| 機能 | 理由 |
|------|------|
| OAuth 認証 | Gemini CLI の Client ID では standard API にアクセス不可 (ADR-009) |
| 非対話モード | GUI アプリなので不要 |
| VS Code 拡張 | 独立アプリとして運用 |
| テレメトリ | デスクトップアプリでは不要 |
| GEMINI.md サポート | 不要 |
| ストリーミング引数 | 非ストリーミング方式を採用 (ADR-014) |
