# ADR-016: 入力バリデーションとサニタイゼーション

## Status: Accepted

## Context
ユーザーから「入力は必ずバリデーション、必須項目チェック、保存時のサニタイゼーション」の指摘。
現在の実装では入力値をそのまま保存・送信しており、不正値やXSSリスクがある。

## Decision
以下のルールを全入力箇所に適用する。

### バリデーション
- 必須項目が空の場合は保存ボタンを無効化
- 文字数上限を設ける（名前: 100文字、説明: 500文字、プロンプト/手順: 10000文字）
- API Key は最低限の形式チェック（空でない、空白のみでない）

### サニタイゼーション
- 保存前に `trim()` で前後空白を除去
- HTML タグを除去（XSS 対策）
- 制御文字を除去（\x00-\x1f、\x7f は改行・タブ以外を除去）

### 対象箇所
- Settings: API Key, System Instruction, MCP JSON
- Templates: name, description, prompt
- Skills: name, description, steps

## Consequences
- 不正データの保存を防止
- XSS リスクを軽減
- ユーザーに明確なフィードバック（ボタン無効化）
