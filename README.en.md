# Gemini Desktop

> **Note:** This app is developed as a bridge until Google releases an official Gemini desktop application. Once the official app is available, this project's role will be complete.

A macOS desktop chat application using the Google Gemini API. Provides the core features of [Gemini CLI](https://github.com/google-gemini/gemini-cli) in a GUI.

[日本語版 README](./README.md)

## Features

- Text chat (non-streaming with thought_signature support)
- Multimodal input (images, PDF, text, Markdown, code — drag & drop, paste)
- Google Search grounding (real-time web search)
- Built-in tools: file read/write/edit, shell commands, grep, glob, web fetch
- MCP server integration (stdio + HTTP transport)
- MCP server host (expose chat to external AI agents via HTTP)
- Tool execution confirmation dialogs
- Prompt templates (customizable presets for new chats)
- Skill system (/skillId workflows — Git Commit, Code Review, Web Research, File Summarizer)
- AI-created skills (create_skill tool)
- Model selection (Gemini 3.x Preview, 2.5 Stable)
- Auto model fallback on rate limits (429)
- Retry with exponential backoff (max 4 attempts)
- Chat compression (auto-summarize after 50 messages)
- Voice input (Web Speech API — Japanese/English)
- Token usage display
- Dark/Light theme (system-aware)
- Japanese/English UI
- macOS .app packaging

## Setup

```bash
npm install
npm start          # Development
npm run make       # Build .app
npm test           # Run tests
npm run lint       # OXLint
npm run format     # Prettier
```

## API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create an API Key
3. Paste it in Settings (Cmd+,) > API Key tab

## MCP Server Host (Experimental)

Enable in Settings > MCP Host tab. Exposes the app as an MCP server so external clients (e.g., Claude Code) can use Gemini chat via HTTP.

- Endpoint: `http://127.0.0.1:3100/mcp` (port configurable)
- Localhost only, disabled by default
- Tools: `send_message`, `create_session`, `list_sessions`, `get_session`

## Tech Stack

| Category | Technology |
|----------|-----------|
| Desktop | Electron + Electron Forge + Vite |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| AI SDK | @google/genai |
| MCP | @modelcontextprotocol/sdk |
| Lint | OXLint + Prettier |
| Test | Vitest (coverage > 80%) |

## Documentation

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Architecture details
- [docs/feature-comparison.md](./docs/feature-comparison.md) — Feature comparison with Gemini CLI
- [docs/adr/](./docs/adr/) — Architecture Decision Records (19 ADRs)
- [docs/backlog.md](./docs/backlog.md) — Feature backlog

## License

Apache License 2.0 — Derivative work of [Google Gemini CLI](https://github.com/google-gemini/gemini-cli). See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

## Author

[Harurow](https://github.com/Harurow)
