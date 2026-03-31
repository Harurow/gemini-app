# ADR-007: OAuth 認証 (Sign in with Google)

## Status: Accepted

## Context
API Key なしでも Gemini API を使えるよう、OAuth 認証を追加する。Gemini CLI と同じ認証フローを実装。

## Decision
Authorization Code Flow + PKCE を採用。Gemini CLI と同じ公開 OAuth Client ID を使用。

## Implementation
- `oauth.service.ts`: OAuth フロー全体を管理
- ローカルに HTTP コールバックサーバー (`127.0.0.1:{random_port}/oauth2callback`) を起動
- ブラウザで Google ログイン画面を開く
- 認証成功後、access_token + refresh_token を取得
- トークンは `safeStorage.encryptString()` で暗号化して `oauth_tokens.enc` に保存
- トークン期限切れ時は refresh_token で自動更新

## Authentication Modes
| モード | 方法 | 制限 |
|--------|------|------|
| OAuth (Sign in with Google) | ブラウザ認証 | 60 req/min, 1,000 req/day |
| API Key | AI Studio で発行 | キー設定の制限に依存 |

## Security
- PKCE (code_challenge_method: S256) でコード横取り攻撃を防止
- state パラメータで CSRF 対策
- トークンは暗号化保存 (safeStorage)
- ファイルパーミッション 0o600

## Consequences
### Positive
- API Key なしで即座に使える（無料枠）
- Gemini CLI と同じ認証情報を共有可能

### Negative
- Gemini CLI の Client ID に依存（Google が変更したら追従が必要）
- OAuth フローはブラウザが必要
