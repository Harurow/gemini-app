# ADR-009: OAuth 認証の制限と API Key 主軸への方針転換

## Status: Accepted

## Context
Gemini CLI の OAuth Client ID (681255809395-...) を使って standard Gemini API (generativelanguage.googleapis.com) にアクセスしようとしたが、以下のエラーが連続発生:

1. `cloud-platform` スコープのみ → `ACCESS_TOKEN_SCOPE_INSUFFICIENT` (403)
2. `generative-language` スコープ追加 → `Unregistered scope(s)` / `restricted_client` (403)

### 原因
- Gemini CLI の Client ID は **Code Assist API 専用** に登録されている
- `generative-language` スコープが Client ID に紐付けられていない
- `cloud-platform` スコープは Vertex AI には使えるが、AI Studio エンドポイントには不十分

## Decision
1. **API Key を主要認証方式とする**（AI Studio で発行、無料枠あり）
2. **OAuth は Vertex AI ユーザー向けのみ**（GCP プロジェクト ID が必要）
3. OAuth で standard Gemini API にアクセスする機能は廃止

## Consequences
### Positive
- API Key は確実に動作する
- セットアップが簡単（AI Studio でワンクリック発行）

### Negative
- API Key なしでの即座利用は不可
- OAuth ユーザーは GCP プロジェクトのセットアップが必要

## 教訓
- 外部サービスの Client ID を借用する場合、**スコープの登録状況を事前に確認する**
- エラーが発生した場合のフォールバック・ユーザーへの通知を必ず実装する
