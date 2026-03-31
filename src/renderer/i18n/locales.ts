export const locales = {
  ja: {
    // App
    'app.name': 'Gemini Desktop',
    'app.loading': '読み込み中...',
    'update.available': '新しいバージョン v{version} が利用可能です',
    'update.download': 'ダウンロード',

    // Welcome
    'welcome.title': 'Gemini Desktop',
    'welcome.description': 'ファイル操作、シェルコマンド、MCP サーバー連携に対応した AI チャットアプリ',
    'welcome.newChat': '新しいチャットを始める',
    'welcome.chooseTemplate': 'テンプレートを選択',
    'welcome.template.general': '汎用',
    'welcome.template.general.desc': '何でも聞けるチャット',
    'welcome.template.code': 'コーディング',
    'welcome.template.code.desc': 'コードの作成・レビュー・デバッグ',
    'welcome.template.writer': 'ライティング',
    'welcome.template.writer.desc': '文章の起草・編集・改善',
    'welcome.template.analyst': 'データ分析',
    'welcome.template.analyst.desc': 'データの分析・可視化・インサイト',

    // Sidebar
    'sidebar.newChat': '新規チャット',
    'sidebar.settings': '設定',
    'sidebar.today': '今日',
    'sidebar.yesterday': '昨日',
    'sidebar.daysAgo': '{n}日前',

    // Chat
    'chat.placeholder': 'メッセージを入力...',
    'chat.send': '送信',
    'chat.stop': '生成を停止',
    'chat.thinking': '考えています...',
    'chat.cancelled': '中断しました',
    'chat.disclaimer': 'Gemini は間違えることがあります。重要な情報は確認してください。',
    'chat.copy': 'コピー',
    'chat.copied': 'コピーしました',
    'chat.status.searching': 'Web を検索中',
    'chat.status.reading': 'ファイルを読み込み中',
    'chat.status.writing': 'ファイルに書き込み中',
    'chat.status.running': '実行中',
    'chat.status.executing': '実行中',
    'chat.status.mcpTool': 'MCP ツール実行中',
    'chat.usage.apiCalls': 'API',
    'chat.usage.input': '入力',
    'chat.usage.output': '出力',
    'chat.usage.total': '合計',
    'chat.attach': 'ファイルを添付',
    'chat.dropHere': 'ここにファイルをドロップ',
    'chat.fileTooBig': 'ファイルサイズが大きすぎます (最大 20MB)',

    // Tool calls
    'tool.arguments': '引数',
    'tool.result': '結果',
    'tool.error': 'エラー',
    'tool.confirm.shell': 'シェルコマンドを実行しますか？',
    'tool.confirm.write': 'ファイルに書き込みますか？',
    'tool.confirm.allow': '許可',
    'tool.confirm.deny': '拒否',

    // Settings
    'settings.title': '設定',
    'settings.tab.apiKey': 'API キー',
    'settings.tab.model': 'モデル',
    'settings.tab.mcp': 'MCP サーバー',
    'settings.tab.mcpServer': 'MCP ホスト',
    'settings.tab.templates': 'テンプレート',
    'settings.tab.skills': 'スキル',
    'settings.tab.appearance': '外観',

    // Settings - API Key
    'settings.apiKey.howTo': 'aistudio.google.com にアクセス → API キーを作成 → コピーして貼り付け',
    'settings.apiKey.active': '有効',
    'settings.apiKey.title': 'Gemini API キー',
    'settings.apiKey.description': 'Google AI Studio (aistudio.google.com) で API キーを取得してください',
    'settings.apiKey.placeholder': 'API キーを入力...',
    'settings.apiKey.save': '保存',
    'settings.cancel': 'キャンセル',
    'settings.apiKey.validate': '検証',
    'settings.apiKey.validating': '検証中...',
    'settings.apiKey.valid': '有効',
    'settings.apiKey.invalid': '無効なキー',
    'settings.saved': '保存しました',
    'settings.or': 'または',

    // Settings - Model
    'settings.model.title': 'デフォルトモデル',
    'settings.model.placeholder': 'モデルを選択...',
    'settings.model.systemInstruction': 'システム指示',
    'settings.model.systemInstruction.desc': 'モデルの動作を制御するカスタム指示',
    'settings.model.systemInstruction.placeholder': 'あなたは親切なアシスタントです...',

    // Settings - MCP
    'settings.mcp.title': 'MCP サーバー設定',
    'settings.mcp.description':
      'JSON 形式で MCP サーバーを設定します。各サーバーには name, transport, command, args が必要です。',
    'settings.mcp.save': '保存',
    'settings.mcp.restart': 'サーバーを再起動',
    'settings.mcp.restarting': '再起動中...',
    'settings.mcp.parseError': 'JSON 形式が無効です',
    'settings.mcp.status': 'サーバーステータス',
    'settings.mcp.tools': '{n}個のツール',

    // Settings - MCP Server Host
    'settings.mcpServer.title': 'MCP サーバー (ホスト)',
    'settings.mcpServer.description':
      'このアプリを MCP サーバーとして公開し、外部の AI エージェントからチャット機能を利用できるようにします。',
    'settings.mcpServer.enabled': 'MCP サーバーを有効化',
    'settings.mcpServer.port': 'ポート番号',
    'settings.mcpServer.start': '起動',
    'settings.mcpServer.stop': '停止',
    'settings.mcpServer.starting': '起動中...',
    'settings.mcpServer.running': '稼働中',
    'settings.mcpServer.stopped': '停止中',
    'settings.mcpServer.endpoint': 'エンドポイント',
    'settings.mcpServer.sessions': 'アクティブセッション: {n}',
    'settings.mcpServer.hostLabel': 'アクセス範囲',
    'settings.mcpServer.lanWarning':
      'LAN モードでは同じネットワーク上の全デバイスからアクセス可能になります。信頼できるネットワークでのみ使用してください。',
    'settings.mcpServer.portError': 'ポート番号は 1024〜65535 の範囲で指定してください',
    'settings.mcpServer.tools': '公開ツール: send_message, create_session, list_sessions, get_session',

    // Settings - Templates
    'settings.templates.title': 'プロンプトテンプレート',
    'settings.templates.description':
      '新規チャット開始時に最初のメッセージとして送信されるプロンプトのプリセットです。',
    'settings.templates.add': 'テンプレートを追加',
    'settings.templates.name': 'テンプレート名',
    'settings.templates.desc': '説明',
    'settings.templates.prompt': 'プロンプト',
    'settings.templates.edit': '編集',
    'settings.templates.delete': '削除',
    'settings.templates.builtIn': '組み込み',
    'settings.templates.builtin.general.name': '汎用',
    'settings.templates.builtin.general.desc': '何でも聞けるチャット',
    'settings.templates.builtin.general.prompt': '(none)',
    'settings.templates.builtin.code.name': 'コーディング',
    'settings.templates.builtin.code.desc': 'コーディング支援',
    'settings.templates.builtin.code.prompt':
      'あなたはエキスパートのソフトウェアエンジニアです。クリーンで構造化されたコードを書き、アプローチを簡潔に説明してください。',
    'settings.templates.builtin.writer.name': 'ライティング',
    'settings.templates.builtin.writer.desc': 'ライティング支援',
    'settings.templates.builtin.writer.prompt':
      'あなたは熟練のライターです。文章の起草、編集、改善を手伝ってください。簡潔で明瞭に。',
    'settings.templates.builtin.analyst.name': 'データ分析',
    'settings.templates.builtin.analyst.desc': 'データ分析',
    'settings.templates.builtin.analyst.prompt':
      'あなたはデータアナリストです。データを分析し、トレンドを説明し、実用的なインサイトを提供してください。必要に応じて表やグラフを使ってください。',

    // Settings - Skills
    'settings.skills.title': 'スキル管理',
    'settings.skills.description': 'チャット中に /スキルID で呼び出す自動化ワークフローです。',
    'settings.skills.add': 'スキルを追加',
    'settings.skills.name': 'スキル名',
    'settings.skills.desc': '説明',
    'settings.skills.instruction': 'システム指示',
    'settings.skills.delete': '削除',
    'settings.skills.builtIn': '組み込み',
    'settings.skills.aiCreated': 'AI 作成',
    'settings.skills.userCreated': 'ユーザー作成',

    // Settings - Appearance
    'settings.theme.title': 'テーマ',
    'settings.theme.system': 'システム設定に従う',
    'settings.theme.system.desc': 'OS の設定に合わせます',
    'settings.theme.light': 'ライト',
    'settings.theme.light.desc': '明るいテーマ',
    'settings.theme.dark': 'ダーク',
    'settings.theme.dark.desc': '暗いテーマ',
    'settings.language.title': '言語',
    'settings.language.ja': '日本語',
    'settings.language.en': 'English',
  },
  en: {
    // App
    'app.name': 'Gemini Desktop',
    'app.loading': 'Loading...',
    'update.available': 'New version v{version} is available',
    'update.download': 'Download',

    // Welcome
    'welcome.title': 'Gemini Desktop',
    'welcome.description': 'AI-powered chat with file access, shell commands, and MCP server integration.',
    'welcome.newChat': 'Start a new chat',
    'welcome.chooseTemplate': 'Choose a template',
    'welcome.template.general': 'General',
    'welcome.template.general.desc': 'Ask anything',
    'welcome.template.code': 'Coding',
    'welcome.template.code.desc': 'Write, review & debug code',
    'welcome.template.writer': 'Writing',
    'welcome.template.writer.desc': 'Draft, edit & improve text',
    'welcome.template.analyst': 'Data Analysis',
    'welcome.template.analyst.desc': 'Analyze, visualize & provide insights',

    // Sidebar
    'sidebar.newChat': 'New Chat',
    'sidebar.settings': 'Settings',
    'sidebar.today': 'Today',
    'sidebar.yesterday': 'Yesterday',
    'sidebar.daysAgo': '{n} days ago',

    // Chat
    'chat.placeholder': 'Send a message...',
    'chat.send': 'Send',
    'chat.stop': 'Stop generating',
    'chat.thinking': 'Thinking...',
    'chat.cancelled': 'Cancelled',
    'chat.disclaimer': 'Gemini can make mistakes. Verify important information.',
    'chat.copy': 'Copy',
    'chat.copied': 'Copied',
    'chat.status.searching': 'Searching the web',
    'chat.status.reading': 'Reading file',
    'chat.status.writing': 'Writing file',
    'chat.status.running': 'Running',
    'chat.status.executing': 'Executing',
    'chat.status.mcpTool': 'Running MCP tool',
    'chat.usage.apiCalls': 'API',
    'chat.usage.input': 'In',
    'chat.usage.output': 'Out',
    'chat.usage.total': 'Total',
    'chat.attach': 'Attach file',
    'chat.dropHere': 'Drop files here',
    'chat.fileTooBig': 'File too large (max 20MB)',

    // Tool calls
    'tool.arguments': 'Arguments',
    'tool.result': 'Result',
    'tool.error': 'Error',
    'tool.confirm.shell': 'Allow shell command execution?',
    'tool.confirm.write': 'Allow file write?',
    'tool.confirm.allow': 'Allow',
    'tool.confirm.deny': 'Deny',

    // Settings
    'settings.title': 'Settings',
    'settings.tab.apiKey': 'API Key',
    'settings.tab.model': 'Model',
    'settings.tab.mcp': 'MCP Servers',
    'settings.tab.mcpServer': 'MCP Host',
    'settings.tab.templates': 'Templates',
    'settings.tab.skills': 'Skills',
    'settings.tab.appearance': 'Appearance',

    // Settings - API Key
    'settings.apiKey.howTo': 'Go to aistudio.google.com → Create API Key → Copy and paste here',
    'settings.apiKey.active': 'Active',
    'settings.apiKey.title': 'Gemini API Key',
    'settings.apiKey.description': 'Get your API key from Google AI Studio (aistudio.google.com)',
    'settings.apiKey.placeholder': 'Enter your API key...',
    'settings.apiKey.save': 'Save',
    'settings.cancel': 'Cancel',
    'settings.apiKey.validate': 'Validate',
    'settings.apiKey.validating': 'Validating...',
    'settings.apiKey.valid': 'Valid',
    'settings.apiKey.invalid': 'Invalid key',
    'settings.saved': 'Saved',
    'settings.or': 'or',

    // Settings - Model
    'settings.model.title': 'Default Model',
    'settings.model.placeholder': 'Select a model...',
    'settings.model.systemInstruction': 'System Instruction',
    'settings.model.systemInstruction.desc': "Custom instructions that guide the model's behavior",
    'settings.model.systemInstruction.placeholder': 'You are a helpful assistant...',

    // Settings - MCP
    'settings.mcp.title': 'MCP Server Configuration',
    'settings.mcp.description':
      'Configure MCP servers in JSON format. Each server needs: name, transport, command, args.',
    'settings.mcp.save': 'Save',
    'settings.mcp.restart': 'Restart Servers',
    'settings.mcp.restarting': 'Restarting...',
    'settings.mcp.parseError': 'Invalid JSON format',
    'settings.mcp.status': 'Server Status',
    'settings.mcp.tools': '{n} tools',

    // Settings - MCP Server Host
    'settings.mcpServer.title': 'MCP Server (Host)',
    'settings.mcpServer.description': 'Expose this app as an MCP server so external AI agents can use chat features.',
    'settings.mcpServer.enabled': 'Enable MCP Server',
    'settings.mcpServer.port': 'Port',
    'settings.mcpServer.start': 'Start',
    'settings.mcpServer.stop': 'Stop',
    'settings.mcpServer.starting': 'Starting...',
    'settings.mcpServer.running': 'Running',
    'settings.mcpServer.stopped': 'Stopped',
    'settings.mcpServer.endpoint': 'Endpoint',
    'settings.mcpServer.sessions': 'Active sessions: {n}',
    'settings.mcpServer.hostLabel': 'Access scope',
    'settings.mcpServer.lanWarning':
      'LAN mode allows access from all devices on the same network. Use only on trusted networks.',
    'settings.mcpServer.portError': 'Port must be between 1024 and 65535',
    'settings.mcpServer.tools': 'Tools: send_message, create_session, list_sessions, get_session',

    // Settings - Templates
    'settings.templates.title': 'Prompt Templates',
    'settings.templates.description': 'Prompt presets sent as the first message when starting a new chat.',
    'settings.templates.add': 'Add Template',
    'settings.templates.name': 'Template Name',
    'settings.templates.desc': 'Description',
    'settings.templates.prompt': 'Prompt',
    'settings.templates.edit': 'Edit',
    'settings.templates.delete': 'Delete',
    'settings.templates.builtIn': 'Built-in',
    'settings.templates.builtin.general.name': 'General',
    'settings.templates.builtin.general.desc': 'Ask anything',
    'settings.templates.builtin.general.prompt': '(none)',
    'settings.templates.builtin.code.name': 'Code Assistant',
    'settings.templates.builtin.code.desc': 'Coding assistance',
    'settings.templates.builtin.code.prompt':
      'You are an expert software engineer. Write clean, structured code and explain your approach concisely.',
    'settings.templates.builtin.writer.name': 'Writing Assistant',
    'settings.templates.builtin.writer.desc': 'Writing assistance',
    'settings.templates.builtin.writer.prompt':
      'You are a skilled writer. Help draft, edit, and improve text. Be concise and clear.',
    'settings.templates.builtin.analyst.name': 'Data Analyst',
    'settings.templates.builtin.analyst.desc': 'Data analysis',
    'settings.templates.builtin.analyst.prompt':
      'You are a data analyst. Analyze data, explain trends, and provide actionable insights. Use tables and charts when appropriate.',

    // Settings - Skills
    'settings.skills.title': 'Skill Management',
    'settings.skills.description': 'Automated workflows invoked with /skillId during chat.',
    'settings.skills.add': 'Add Skill',
    'settings.skills.name': 'Skill Name',
    'settings.skills.desc': 'Description',
    'settings.skills.instruction': 'System Instruction',
    'settings.skills.delete': 'Delete',
    'settings.skills.builtIn': 'Built-in',
    'settings.skills.aiCreated': 'AI Created',
    'settings.skills.userCreated': 'User Created',

    // Settings - Appearance
    'settings.theme.title': 'Theme',
    'settings.theme.system': 'System',
    'settings.theme.system.desc': 'Follow system preference',
    'settings.theme.light': 'Light',
    'settings.theme.light.desc': 'Light theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.dark.desc': 'Dark theme',
    'settings.language.title': 'Language',
    'settings.language.ja': '日本語',
    'settings.language.en': 'English',
  },
} as const;

export type Locale = keyof typeof locales;
export type TranslationKey = keyof (typeof locales)['ja'];
