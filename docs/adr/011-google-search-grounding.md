# ADR-011: Google Search grounding と Function Calling の併用不可

## Status: Accepted

## Context
Google Search grounding (`googleSearch: {}`) を tools 配列に追加したところ、
Function Calling (functionDeclarations) と同じリクエストで併用すると 400 エラーが発生。

```
Built-in tools ({google_search}) and Function Calling cannot be combined in the same request.
```

## Decision
- Function declarations がある場合（通常のチャット）: Google Search は無効、`web_fetch` ツールで Web 情報を取得
- Function declarations がない場合: Google Search grounding を有効化

## Rationale
- `web_fetch` ツールが既に実装済みで、URL 指定の Web コンテンツ取得が可能
- Gemini モデルは `web_fetch` ツールを使って検索結果を取得できる
- 将来的に Gemini 3.x で併用制限が解除される可能性あり

## Consequences
### Positive
- 400 エラーが解消
- ビルトインツールとの競合なし

### Negative
- Google Search grounding の検索品質（引用付き）は `web_fetch` では再現不可
- モデルが自発的に `web_fetch` を呼ぶかはプロンプト次第
