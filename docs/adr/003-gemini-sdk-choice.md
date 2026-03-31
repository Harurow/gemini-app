# ADR-003: Gemini SDK 選定

## Status: Accepted

## Context
Gemini API との通信に使用する SDK を決定する。

## Decision
`@google/genai` (公式 Gemini SDK for JavaScript/TypeScript) を採用。

## Rationale
- Gemini CLI が使用している公式 SDK
- ストリーミング対応 (`generateContentStream`)
- Function Calling (ツール呼び出し) のネイティブサポート
- Google Search grounding のネイティブサポート
- 活発なメンテナンス（npm weekly downloads: 500K+）

## Key Implementation
- `GeminiService` クラスで SDK をラップ
- エージェントツールループ: 生成 → ツール実行 → 再生成の反復
- `AbortController` によるストリーミングキャンセル

## Consequences
- Gemini API 専用（OpenAI 等との互換性なし — 現時点では要件外）
