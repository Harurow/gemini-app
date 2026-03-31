# 機能比較: Gemini CLI vs Gemini Desktop

> Gemini CLI の機能に対する Gemini Desktop の対応状況一覧。
> 最終更新: 2026-03-31

## 凡例

- ✅ 対応済み
- 🔄 形を変えて対応
- 📋 TODO (バックログ)
- ➖ 不要 / 対象外

---

## チャット・基本機能

| 機能 | CLI | Desktop | 備考 |
|------|-----|---------|------|
| テキストチャット | ✅ | ✅ | 非ストリーミング (thought_signature 保持, ADR-014) |
| マルチモーダル入力 (画像/PDF) | ✅ | ✅ | D&D、ペースト対応 |
| マルチモーダル入力 (音声) | ✅ | 📋 | TODO #17: Gemini API 文字起こし |
| Google Search grounding | ✅ | ✅ | 2段階方式 (ADR-013) |
| チャット圧縮 (/compress) | ✅ | ✅ | 50メッセージ超で自動要約 |
| トークン使用量表示 | ✅ | ✅ | API 呼び出し数 + 入出力トークン |
| Escape でキャンセル | ✅ | ✅ | ストリーミング/スキル実行中 |
| 画面クリア (/clear) | ✅ | 📋 | TODO #4 |
| 最後の応答をコピー (/copy) | ✅ | 📋 | TODO #4 (メッセージ単位のコピーは実装済み) |
| Plan Mode | ✅ | 📋 | TODO #1: 読み取り専用計画→承認→実装 |
| Rewind / Restore | ✅ | 📋 | TODO #3: 会話巻き戻し + ファイル復元 |
| @ ファイル参照 | ✅ | 📋 | TODO #2: 入力欄で @ → ファイルピッカー |
| パイプ入力 (stdin) | ✅ | ➖ | CLI 固有 |

## ツール

| ツール | CLI | Desktop | 備考 |
|--------|-----|---------|------|
| read_file | ✅ | ✅ | 行範囲指定対応 |
| read_many_files | ✅ | 📋 | TODO #2 の @ 参照と連動 |
| write_file | ✅ | ✅ | 確認ダイアログ付き |
| replace (edit_file) | ✅ | ✅ | 確認ダイアログ付き |
| run_shell_command | ✅ | ✅ | 確認ダイアログ、タイムアウト 30s |
| glob | ✅ | ✅ | |
| grep_search | ✅ | ✅ | |
| list_directory | ✅ | 📋 | TODO #11 |
| web_fetch | ✅ | ✅ | Electron net.fetch (ADR-012) |
| google_web_search | ✅ | ✅ | |
| enter_plan_mode / exit_plan_mode | ✅ | 📋 | TODO #1 |
| save_memory | ✅ | ➖ | GEMINI.md 不採用。System Instruction で代替 |
| activate_skill | ✅ | 🔄 | スキルシステムとして再実装 |
| get_internal_docs | ✅ | ➖ | CLI 固有 |
| ask_user | ✅ | ➖ | GUI では直接対話 |
| write_todos | ✅ | ➖ | CLI 内部用 |

## セッション管理

| 機能 | CLI | Desktop | 備考 |
|------|-----|---------|------|
| セッション作成 | ✅ | ✅ | |
| セッション切替 | ✅ | ✅ | サイドバーから選択 |
| セッション削除 | ✅ | ✅ | |
| タイトル自動生成 | ✅ | ✅ | 最初のメッセージから生成 |
| セッション再開 (resume) | ✅ | ✅ | サイドバーから選択 |
| セッション検索・タグ | ✅ | 📋 | TODO #12 |
| セッション共有・エクスポート | ✅ | 📋 | TODO #6: Markdown/JSON |
| Rewind (巻き戻し) | ✅ | 📋 | TODO #3 |
| Restore (ファイル復元) | ✅ | 📋 | TODO #3 |
| Git worktree 隔離 | ✅ | ➖ | CLI 向けワークフロー |

## モデル・認証

| 機能 | CLI | Desktop | 備考 |
|------|-----|---------|------|
| モデル選択 | ✅ | ✅ | Gemini 3.x Preview + 2.5 Stable |
| モデルフォールバック (429) | ✅ | ✅ | 自動降格 |
| リトライ (指数バックオフ) | ✅ | ✅ | 最大4回 |
| API Key 認証 | ✅ | ✅ | safeStorage 暗号化 |
| OAuth (Sign in with Google) | ✅ | ➖ | 標準 API 非対応 (ADR-009) |
| Vertex AI | ✅ | ➖ | エンタープライズ向け |
| Service Account | ✅ | ➖ | CI/CD 向け |

## MCP (Model Context Protocol)

| 機能 | CLI | Desktop | 備考 |
|------|-----|---------|------|
| MCP クライアント (stdio) | ✅ | ✅ | |
| MCP クライアント (HTTP) | ✅ | ✅ | Streamable HTTP |
| MCP サーバーホスト | ➖ | ✅ | Desktop 独自。外部 AI からチャット利用 (実験的, ADR-018) |
| MCP リソース/プロンプト | ✅ | 📋 | TODO #18 |
| MCP OAuth 認証 | ✅ | ➖ | |
| MCP ツール限定 (include-tools) | ✅ | ➖ | |

## スキル・拡張

| 機能 | CLI | Desktop | 備考 |
|------|-----|---------|------|
| スキルシステム | ✅ | 🔄 | /スキルID で実行。4組み込み + AI/ユーザー作成 |
| スキル作成 (create_skill) | ✅ | ✅ | AI がスキルを作成 |
| Extensions (拡張パッケージ) | ✅ | ➖ | スキルで部分カバー |
| カスタムコマンド | ✅ | ➖ | スキルで代替 |
| Subagents | ✅ | ➖ | 将来検討 |
| Hooks (ライフサイクル) | ✅ | ➖ | 現状の規模では過剰 |

## セキュリティ・承認

| 機能 | CLI | Desktop | 備考 |
|------|-----|---------|------|
| ツール承認 (確認ダイアログ) | ✅ | ✅ | shell/write/edit |
| 承認モード切替 | ✅ | 📋 | TODO #5: default/auto_edit/yolo |
| Trusted Folders | ✅ | 📋 | TODO #13 |
| サンドボックス (Docker) | ✅ | 📋 | TODO #14 |
| サンドボックス (Seatbelt/gVisor) | ✅ | ➖ | CLI 固有 |
| Policy Engine (TOML) | ✅ | ➖ | エンタープライズ向け |
| 入力バリデーション | ➖ | ✅ | Desktop 独自 (ADR-016) |

## UI・操作

| 機能 | CLI | Desktop | 備考 |
|------|-----|---------|------|
| ダーク/ライトテーマ | ✅ | ✅ | システム連動 + 手動切替 |
| 日本語/英語 UI | ➖ | ✅ | Desktop 独自 |
| プロンプトテンプレート | ➖ | ✅ | Desktop 独自。チャット開始時の定型プロンプト |
| System Instruction | 🔄 | ✅ | CLI は GEMINI.md、Desktop は設定画面 |
| ファイル添付 (D&D/ペースト) | ➖ | ✅ | Desktop 独自の GUI 操作 |
| スラッシュコマンド補完 | ✅ | 📋 | TODO #7 |
| Vim モード | ✅ | ➖ | CLI 固有 |
| スクリーンリーダー | ✅ | ➖ | OS レベルで対応 |
| 保存フィードバック統一 | ➖ | ✅ | Desktop 独自 (ADR-017) |

## インフラ・配布

| 機能 | CLI | Desktop | 備考 |
|------|-----|---------|------|
| macOS アプリ配布 | ➖ | ✅ | .app パッケージング |
| 自動更新 | ✅ | 📋 | TODO #16: electron-updater |
| 多重起動防止 | ➖ | ✅ | Desktop 独自 |
| テスト (86%+ カバレッジ) | ✅ | ✅ | vitest |
| CI/CD (GitHub Actions) | ✅ | ✅ | lint → format → test → build |
| OXLint + Prettier | ➖ | ✅ | pre-commit hook |

## コンテキスト管理

| 機能 | CLI | Desktop | 備考 |
|------|-----|---------|------|
| GEMINI.md | ✅ | ➖ | 不採用。System Instruction で代替 |
| .geminiignore | ✅ | ➖ | |
| JIT コンテキスト読み込み | ✅ | ➖ | |

---

## Desktop 独自機能

このアプリにしかない機能:

- **MCP サーバーホスト** — 外部 AI エージェントから HTTP 経由でチャット利用 (ADR-018)
- **日本語/英語 UI** — 自動検出 + 手動切替 (i18n)
- **プロンプトテンプレート** — チャット開始時の定型プロンプト選択
- **ファイル添付 GUI** — D&D、ペースト、ファイルピッカー
- **入力バリデーション** — sanitize + maxLength (ADR-016)
- **保存フィードバック統一** — 全設定タブで「保存しました」表示 (ADR-017)
