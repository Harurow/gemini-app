# ADR-013: Google Search の Gemini CLI 互換実装

## Status: Accepted (ADR-011 を補完)

## Context
ADR-011 で Google Search と Function Calling の併用不可を記録。
web_fetch による HTML 取得では JS 動的レンダリングのサイト（株価等）の情報が取れない。
Gemini CLI のソースコードを調査した結果、以下のアーキテクチャが判明。

## Decision
**Gemini CLI と同一の実装**を採用:

1. `google_web_search` を通常の **function declaration** として登録
2. モデルが `google_web_search` を呼んだら、CLI 側（tool executor）で処理
3. tool executor 内で **別の API コール** を `{ googleSearch: {} }` 付きで発行
4. grounding 結果を function response としてメインチャットに返却

```
メインチャット: tools = [{ functionDeclarations: [..., google_web_search, ...] }]
                         ↑ googleSearch built-in は含まない

モデル → "google_web_search({ query: '日経平均' })"
  ↓
web-search.tool.ts → 別 API コール (model: gemini-2.5-flash, tools: [{ googleSearch: {} }])
  ↓
grounding 結果を返却
```

## thought_signature 対応
Gemini 2.5/3.x では function call パーツに `thought_signature` が含まれる。
手動でパーツを構築すると signature が失われて 400 エラー。
API レスポンスの Content オブジェクトをそのまま会話履歴に使うことで解決。

## Consequences
### Positive
- Gemini CLI と完全に同じアーキテクチャ
- googleSearch と functionDeclarations が同じリクエストに共存しない
- thought_signature が保持される
- リアルタイム情報（株価、ニュース等）を正確に取得

### Negative
- 検索時は API 呼び出しが2回（メイン + grounding）
