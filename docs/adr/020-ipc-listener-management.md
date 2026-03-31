# ADR-020: IPC リスナー管理と removeAllListeners の危険性

## ステータス

Accepted

## コンテキスト

ChatView コンポーネントで `window.api.removeAllListeners('session:updated')` を useEffect のクリーンアップで呼んでいた。これにより App.tsx で登録した同チャネルのリスナーも削除され、サイドバーのセッション更新が動作しなくなった。

MCP ホストからのリアルタイムチャット表示も同様の問題で動作しなかった。

## 発生原因

1. `removeAllListeners(channel)` は**そのチャネルの全リスナー**を削除する
2. 複数コンポーネントが同じチャネルをリスンしている場合、一方のクリーンアップで他方が破壊される
3. レビューで IPC リスナーのライフサイクルを確認していなかった

## 決定

### リスナー登録ルール

1. **1回のみ登録**: `useRef(false)` ガードで多重登録を防ぐ（useChat hook パターン）
2. **removeAllListeners 禁止**: コンポーネントのクリーンアップで `removeAllListeners` を使わない
3. **集約**: 同種のイベント（チャット系、MCP 系）は1つの hook に集約する
4. **Zustand 経由**: IPC イベントは store に反映し、コンポーネントは store を購読する

### 適用

- チャット系イベント (stream-chunk, tool-call 等) → `useChat` hook で1回登録
- MCP リアルタイムイベント → `useChat` hook で1回登録
- セッション更新イベント → `App.tsx` で1回登録
- アプリイベント (open-settings 等) → `App.tsx` で1回登録

### メッセージ重複防止

MCP リアルタイムイベントでメッセージを `addMessage` で追加した後、`session:updated` イベントでセッションを再読み込みすると同じメッセージが二重に表示される。

**対策**: MCP の `stream-end` イベント受信後に `getSession` でストアから最新メッセージを取得し、`setMessages` で全置換する。リアルタイム追加分を正規化された状態にリセットする。

## 結果

- ChatView から `removeAllListeners` を全て除去
- MCP イベント処理を `useChat` hook に統合
- リスナーの重複登録・相互破壊を防止
- MCP stream-end 後にセッション再読み込みで重複メッセージを防止
