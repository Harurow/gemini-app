import ElectronStore from 'electron-store';
import { safeStorage } from 'electron';

// Handle ESM/CJS interop
const Store = (ElectronStore as unknown as { default: typeof ElectronStore }).default || ElectronStore;

export interface McpServerConfig {
  name: string;
  transport?: 'stdio' | 'http';
  type?: 'stdio' | 'http';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  enabled?: boolean;
}

// Prompt Template — チャット開始時に最初のメッセージとして送られる定型プロンプト
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string; // ユーザーメッセージとして送信される
  model?: string;
  icon?: string;
  builtIn?: boolean;
}

// Skill — チャット中に呼び出す自動化ワークフロー
export interface Skill {
  id: string;
  name: string;
  description: string;
  steps: string; // Markdown形式の手順書。AIがこの通りに実行する
  icon?: string;
  builtIn?: boolean;
  createdBy?: 'user' | 'ai';
}

// Backward compat
export type ChatTemplate = PromptTemplate;

export interface McpServerSettings {
  enabled: boolean;
  port: number;
  host: 'localhost' | 'lan';
}

export interface AppSettings {
  apiKey: string;
  defaultModel: string;
  systemInstruction: string;
  theme: 'light' | 'dark' | 'system';
  mcpServers: McpServerConfig[];
  mcpServerHost: McpServerSettings;
  sidebarWidth: number;
  notificationSound: boolean;
  chatTemplates: PromptTemplate[];
  skills: Skill[];
}

export const defaults: AppSettings = {
  apiKey: '',
  defaultModel: 'gemini-3-flash-preview',
  systemInstruction: '',
  theme: 'system',
  mcpServers: [],
  mcpServerHost: { enabled: false, port: 3100, host: 'localhost' },
  notificationSound: true,
  sidebarWidth: 280,
  chatTemplates: [
    {
      id: 'general',
      name: 'General',
      description: '汎用チャット',
      prompt: '',
      builtIn: true,
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    },
    {
      id: 'code',
      name: 'Code Assistant',
      description: 'コーディング支援',
      prompt:
        'あなたはエキスパートのソフトウェアエンジニアです。クリーンで構造化されたコードを書き、アプローチを簡潔に説明してください。',
      builtIn: true,
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    },
    {
      id: 'writer',
      name: 'Writing Assistant',
      description: 'ライティング支援',
      prompt: 'あなたは熟練のライターです。文章の起草、編集、改善を手伝ってください。簡潔で明瞭に。',
      builtIn: true,
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    },
    {
      id: 'analyst',
      name: 'Data Analyst',
      description: 'データ分析',
      prompt:
        'あなたはデータアナリストです。データを分析し、トレンドを説明し、実用的なインサイトを提供してください。必要に応じて表やグラフを使ってください。',
      builtIn: true,
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
  ],
  skills: [
    {
      id: 'commit',
      name: 'Git Commit',
      description: '変更を分析してコミットメッセージを生成・コミット',
      builtIn: true,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      steps: `# Git Commit スキル

## 手順
1. \`run_shell_command\` で \`git status\` を実行して変更内容を確認
2. \`run_shell_command\` で \`git diff\` を実行して差分を確認
3. 変更内容を分析し、適切なコミットメッセージを日本語で生成
   - type prefix を付ける: feat:, fix:, docs:, refactor:, chore:
4. ユーザーにコミットメッセージを提示して確認を求める
5. 承認されたら \`run_shell_command\` で \`git add\` と \`git commit\` を実行`,
    },
    {
      id: 'review-code',
      name: 'Code Review',
      description: 'ファイルやディレクトリのコードをレビュー',
      builtIn: true,
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      steps: `# Code Review スキル

## 手順
1. ユーザーにレビュー対象のファイルパスまたはディレクトリを聞く
2. \`read_file\` または \`grep\` / \`glob\` で対象コードを読み込む
3. 以下の観点でレビューする:
   - バグ・ロジックエラー
   - セキュリティ上の問題
   - パフォーマンス改善の余地
   - コードの可読性・命名
   - テストの有無・カバレッジ
4. 問題点を重要度順にリストアップし、改善案を具体的に提示する`,
    },
    {
      id: 'research',
      name: 'Web Research',
      description: 'Webを調べて要約するリサーチ',
      builtIn: true,
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      steps: `# Web Research スキル

## 手順
1. ユーザーの質問・調査テーマを確認する
2. \`google_web_search\` でWeb検索を実行（複数回可）
3. 必要に応じて \`web_fetch\` で詳細ページを取得
4. 情報を整理して以下の形式で要約する:
   - **概要**: 1-2文の要約
   - **詳細**: 主要なポイントを箇条書き
   - **ソース**: 参照元のURL
5. 情報が不十分な場合は追加検索する`,
    },
    {
      id: 'summarize-files',
      name: 'File Summarizer',
      description: 'ファイル群を読んでドキュメントを生成',
      builtIn: true,
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      steps: `# File Summarizer スキル

## 手順
1. ユーザーに対象ディレクトリまたはファイルパターンを聞く
2. \`glob\` でファイル一覧を取得
3. \`read_file\` で各ファイルの内容を読み込む
4. ファイル構成・主要機能・依存関係を分析
5. 以下を含むドキュメントを生成:
   - プロジェクト概要
   - ディレクトリ構成
   - 主要ファイルの説明
   - 技術スタックとアーキテクチャ`,
    },
  ],
};

const store = new Store<AppSettings>({
  name: 'settings',
  defaults,
});

export function getSettings(): AppSettings {
  const settings = store.store;
  if (settings.apiKey && safeStorage.isEncryptionAvailable()) {
    try {
      const buffer = Buffer.from(settings.apiKey, 'base64');
      settings.apiKey = safeStorage.decryptString(buffer);
    } catch {
      // Key might be stored in plaintext (first run or migration)
    }
  }
  // Ensure skills array exists (migration from old settings)
  if (!settings.skills) {
    settings.skills = defaults.skills;
  }
  // Ensure mcpServerHost exists (migration from old settings)
  if (!settings.mcpServerHost) {
    settings.mcpServerHost = defaults.mcpServerHost;
  } else if (!settings.mcpServerHost.host) {
    settings.mcpServerHost.host = 'localhost';
  }
  return settings;
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  if (partial.apiKey !== undefined && safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(partial.apiKey);
    partial.apiKey = encrypted.toString('base64');
  }
  store.set(partial as Record<string, unknown>);
  return getSettings();
}

export function getRawApiKey(): string {
  return getSettings().apiKey;
}

export { store };
