# ADR-021: IME 変換中の Enter 送信防止

## ステータス

Accepted

## コンテキスト

チャット入力欄で日本語 IME の変換確定のために Enter を押すと、メッセージが送信されてしまう。IME の変換確定とメッセージ送信の Enter キーが区別されていなかった。

## 決定

`handleKeyDown` の先頭で `e.nativeEvent.isComposing` をチェックし、IME 変換中は全てのキー処理をスキップする。

```typescript
if (e.nativeEvent.isComposing) return;
```

これにより:
- IME 変換確定の Enter → 無視（変換確定のみ）
- IME 変換後の Enter → メッセージ送信
- スキルメニューの上下キー操作も IME と干渉しない

## 結果

- 日本語・中国語等の IME 使用時に意図しない送信が発生しなくなった
- `keydown` イベントを扱う全てのハンドラで `isComposing` チェックを行うべき
