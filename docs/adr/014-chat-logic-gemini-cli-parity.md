# ADR-014: チャットロジックを Gemini CLI と完全一致させる

## Status: Accepted

## Context
独自実装のストリーミング + 非ストリーミング混合アプローチで `thought_signature` エラーが繰り返し発生。
ユーザーから「根本的なチャットロジックは Gemini CLI と同じにすべき」との指摘。

## Decision
API 呼び出しは全て **非ストリーミング (`generateContent`)** を使用する。

### Gemini CLI のフロー (本アプリで再現)
```
1. generateContent() で完全なレスポンスを取得
2. レスポンスのテキストを UI に送信（表示）
3. functionCall があれば:
   a. ツールを実行
   b. functionResponse を構築
   c. レスポンスの Content (thought_signature 含む) をそのまま履歴に追加
   d. 1に戻る
4. functionCall がなければ完了
```

### ストリーミング表示
テキストを一括ではなくチャンク分割して UI に送ることで、体感的なストリーミングを実現する。
実際の API は非ストリーミングだが、ユーザー体験は変わらない。

## Rationale
- `thought_signature` は `generateContent` の完全なレスポンスにのみ含まれる
- ストリーミングチャンクでは thought_signature が断片化して正しく保持できない
- Gemini CLI も内部的には非ストリーミングでツールループを回している

## Consequences
### Positive
- thought_signature エラーが完全に解消
- Gemini CLI と同一のロジック
- コードがシンプルになる

### Negative
- テキスト表示の即時性がわずかに低下（全文取得後に表示開始）
- ただしチャンク分割送信で体感差は最小限
