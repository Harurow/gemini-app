# ADR-012: web_fetch ツールで Electron net.fetch を使用

## Status: Accepted

## Context
web_fetch ツールで Node.js のグローバル `fetch` を使用していたが、Electron Main Process では動作が不安定。
またモデルが「web_fetch を使います」と言った後に実際のツール呼び出しが発生しない問題があった。

## Decision
1. `fetch` → `net.fetch` (Electron 組み込み) に変更
2. User-Agent を一般的なブラウザに偽装（Google 検索等でブロックされないため）
3. ツール説明文に「Web 検索には google.com/search?q= を使う」と明記
4. ストリーミング中の functionCall 検出を複数パスで行う（chunk.candidates + chunk.functionCalls）

## Consequences
- Electron のプロキシ・証明書設定が自動で使われる
- Google 検索結果の HTML が取得可能になる
