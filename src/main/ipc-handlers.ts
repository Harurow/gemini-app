import { ipcMain, BrowserWindow, shell } from 'electron';
import { geminiService } from './services/gemini.service';
import { sessionService } from './services/session.service';
import { mcpService } from './services/mcp.service';
import { mcpServerService } from './services/mcp-server.service';
import { updateService } from './services/update.service';
// OAuth removed — see ADR-009. API Key is the only auth method.
import { toolRegistry } from './tools/tool-registry';
import { getSettings, updateSettings, defaults, type AppSettings } from './store';

export function registerIpcHandlers(getWindow: () => BrowserWindow | null): void {
  // --- Tool confirmation ---
  const pendingConfirms = new Map<string, (approved: boolean) => void>();

  toolRegistry.setConfirmCallback(async (name, args) => {
    const win = getWindow();
    if (!win) return true; // allow if no window

    const id = `confirm_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return new Promise<boolean>((resolve) => {
      pendingConfirms.set(id, resolve);
      win.webContents.send('tool:confirm-request', { id, name, args });

      // 通知音
      if (getSettings().notificationSound) {
        shell.beep();
      }

      // Auto-approve after 60s timeout
      setTimeout(() => {
        if (pendingConfirms.has(id)) {
          pendingConfirms.delete(id);
          resolve(false); // deny on timeout
        }
      }, 60_000);
    });
  });

  ipcMain.handle('tool:confirm-response', async (_, id: string, approved: boolean) => {
    const resolve = pendingConfirms.get(id);
    if (resolve) {
      pendingConfirms.delete(id);
      resolve(approved);
    }
  });

  // --- App info ---
  ipcMain.handle('app:get-cwd', async () => {
    return process.cwd();
  });

  // --- Settings ---
  ipcMain.handle('settings:get', async () => {
    return getSettings();
  });

  ipcMain.handle('settings:update', async (_, partial: Partial<AppSettings>) => {
    const updated = updateSettings(partial);

    // Re-initialize Gemini if API key changed
    if (partial.apiKey !== undefined && partial.apiKey) {
      geminiService.initialize(partial.apiKey);
    }

    // Re-initialize MCP if servers changed
    if (partial.mcpServers !== undefined) {
      await mcpService.initialize(partial.mcpServers);
    }

    // Manage MCP server host
    if (partial.mcpServerHost !== undefined) {
      const mcpHost = partial.mcpServerHost as { enabled: boolean; port: number; host: 'localhost' | 'lan' };
      if (mcpHost.enabled) {
        await mcpServerService.start(mcpHost.port, mcpHost.host).catch(console.error);
      } else {
        await mcpServerService.stop().catch(console.error);
      }
    }

    return updated;
  });

  ipcMain.handle('settings:get-defaults', async () => {
    return { chatTemplates: defaults.chatTemplates, skills: defaults.skills };
  });

  ipcMain.handle('settings:validate-key', async (_, key: string) => {
    return geminiService.validateApiKey(key);
  });

  // --- Sessions ---
  ipcMain.handle('session:list', async () => {
    return sessionService.list();
  });

  ipcMain.handle('session:create', async (_, templateId?: string) => {
    const settings = getSettings();
    const template = templateId ? settings.chatTemplates?.find((t) => t.id === templateId) : undefined;
    const session = await sessionService.create(template?.model || settings.defaultModel);
    // Return template prompt so Renderer can auto-send it
    return {
      ...session,
      initialPrompt: template?.prompt || (template as Record<string, unknown>)?.systemInstruction || '',
    };
  });

  ipcMain.handle('session:get', async (_, id: string) => {
    return sessionService.get(id);
  });

  ipcMain.handle('session:delete', async (_, id: string) => {
    return sessionService.delete(id);
  });

  // --- Chat ---
  ipcMain.handle(
    'chat:send',
    async (
      _,
      sessionId: string,
      message: string,
      attachments?: Array<{ base64: string; mimeType: string; name: string }>,
    ) => {
      const win = getWindow();
      if (!win) throw new Error('No window available');

      const settings = getSettings();

      // Initialize Gemini if not already
      if (!geminiService.isInitialized() && settings.apiKey) {
        geminiService.initialize(settings.apiKey);
      }

      if (!geminiService.isInitialized()) {
        const msg =
          'API キーが未設定です。設定画面 (Cmd+,) で Gemini API キーを設定してください。\naistudio.google.com でキーを無料で取得できます。';
        win.webContents.send('chat:stream-error', msg);
        return { success: false, error: msg };
      }

      const session = await sessionService.get(sessionId);
      if (!session) {
        win.webContents.send('chat:stream-error', 'Session not found');
        return { success: false, error: 'Session not found' };
      }

      // Skill invocation: if message starts with /skillId, inject skill steps
      let actualMessage = message;
      let skillInstruction = '';
      if (message.startsWith('/')) {
        const skillId = message.slice(1).split(/\s/)[0];
        const skill = settings.skills?.find(
          (s) => s.id === skillId || s.name.toLowerCase().replace(/\s+/g, '-') === skillId.toLowerCase(),
        );
        if (skill) {
          const userArgs = message.slice(1 + skillId.length).trim();
          actualMessage = userArgs || `スキル「${skill.name}」を実行してください。`;
          skillInstruction = `\n\n[スキル実行: ${skill.name}]\n以下の手順に従って実行してください:\n${skill.steps}`;
        }
      }

      try {
        const baseInstruction = session.systemInstruction || settings.systemInstruction || '';
        const newContents = await geminiService.sendMessage({
          model: session.model || settings.defaultModel,
          message: actualMessage,
          attachments,
          history: session.messages,
          systemInstruction: baseInstruction + skillInstruction || undefined,
          toolRegistry,
          onChunk: (chunk) => {
            win.webContents.send('chat:stream-chunk', chunk);
          },
          onFinalizeChunk: () => {
            win.webContents.send('chat:stream-finalize');
          },
          onToolCall: (info) => {
            win.webContents.send('chat:tool-call', info);
          },
          onToolResult: (info) => {
            win.webContents.send('chat:tool-result', info);
          },
          onUsage: (usage) => {
            win.webContents.send('chat:usage', usage);
          },
        });

        // Persist messages
        const updatedSession = await sessionService.appendMessages(sessionId, newContents);

        win.webContents.send('chat:stream-end');
        // Notify renderer of session update (for sidebar title refresh)
        if (updatedSession) {
          win.webContents.send('session:updated', {
            id: updatedSession.id,
            title: updatedSession.title,
          });
        }
        return { success: true };
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Chat error:', errorMsg);
        win.webContents.send('chat:stream-error', errorMsg);
        return { success: false, error: errorMsg };
      }
    },
  );

  ipcMain.handle('chat:cancel', async () => {
    geminiService.cancel();
    return { success: true };
  });

  // --- MCP ---
  ipcMain.handle('mcp:status', async () => {
    return mcpService.getStatus();
  });

  ipcMain.handle('mcp:restart', async () => {
    const settings = getSettings();
    await mcpService.initialize(settings.mcpServers);
    return mcpService.getStatus();
  });

  // --- MCP Server (Host) ---
  ipcMain.handle('mcp-server:status', async () => {
    return mcpServerService.getStatus();
  });

  ipcMain.handle('mcp-server:start', async (_, port?: number, host?: 'localhost' | 'lan') => {
    const settings = getSettings();
    await mcpServerService.start(
      port || settings.mcpServerHost?.port || 3100,
      host || settings.mcpServerHost?.host || 'localhost',
    );
    return mcpServerService.getStatus();
  });

  ipcMain.handle('mcp-server:stop', async () => {
    await mcpServerService.stop();
    return mcpServerService.getStatus();
  });

  // --- Update check ---
  ipcMain.handle('update:check', async () => {
    return updateService.check();
  });

  // Initialize services on startup
  const settings = getSettings();
  if (settings.apiKey) {
    geminiService.initialize(settings.apiKey);
  }
  if (settings.mcpServers.length > 0) {
    mcpService.initialize(settings.mcpServers).catch(console.error);
  }

  // Auto-start MCP server if enabled
  if (settings.mcpServerHost?.enabled) {
    mcpServerService.start(settings.mcpServerHost.port, settings.mcpServerHost.host).catch(console.error);
  }
}
