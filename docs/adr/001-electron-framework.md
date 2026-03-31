# ADR-001: Electron フレームワーク選定

## Status: Accepted

## Context
Mac デスクトップアプリとして Gemini CLI の機能を GUI 化する必要がある。

## Decision
Electron (v41) + Electron Forge + Vite を採用。

## Rationale
- Node.js エコシステムとの完全な互換性（@google/genai SDK, @modelcontextprotocol/sdk）
- macOS .app パッケージングの成熟したサポート
- 最も情報が豊富なデスクトップフレームワーク（npm weekly downloads: 2M+）
- Electron Forge は Electron 公式推奨のビルドツール

## Alternatives Considered
- Tauri: Rust ベース。軽量だが Node.js SDK との統合に追加作業が必要
- NW.js: コミュニティが縮小傾向

## Consequences
- バンドルサイズが大きい（~150MB）がデスクトップアプリとして許容範囲
- Chromium 同梱によるメモリ使用量
