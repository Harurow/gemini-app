import { useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chat-store';
import { useAppStore } from '../store/app-store';
import type { Message, ToolCallDisplay, Session } from '../types/chat';

// Module-level guard: IPC listeners must be registered exactly once
let ipcListenersRegistered = false;

export function useChat() {
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingText = useChatStore((s) => s.streamingText);
  const pendingToolCalls = useChatStore((s) => s.pendingToolCalls);
  const error = useChatStore((s) => s.error);

  useEffect(() => {
    if (ipcListenersRegistered) return;
    ipcListenersRegistered = true;

    window.api.onStreamChunk((chunk: string) => {
      useChatStore.getState().appendStreamChunk(chunk);
    });

    window.api.onStreamEnd(() => {
      useChatStore.getState().finalizeStream();
    });

    window.api.onStreamFinalize(() => {
      // Finalize current streaming text as a message without stopping streaming
      const state = useChatStore.getState();
      if (state.streamingText) {
        useChatStore.getState().finalizeStream();
        // Keep streaming flag on since more responses are coming
        useChatStore.setState({ isStreaming: true });
      }
    });

    window.api.onStreamError((error: string) => {
      useChatStore.getState().setError(error);
      useChatStore.getState().setStreaming(false);
    });

    window.api.onToolCall((info: unknown) => {
      const tc = info as ToolCallDisplay;
      useChatStore.getState().addToolCall(tc);
    });

    window.api.onToolResult((info: unknown) => {
      const tr = info as { id: string; result: unknown; error?: string; duration?: number };
      useChatStore.getState().updateToolResult(tr.id, tr.result, tr.error, tr.duration);
    });

    window.api.onUsage((usage) => {
      useChatStore.getState().setUsage(usage);
    });

    window.api.onModelChange((model: string) => {
      useChatStore.setState({ activeModel: model });
    });

    // MCP host real-time events
    window.api.onMcpChatEvent((data: { sessionId: string; type: string; [key: string]: unknown }) => {
      const store = useChatStore.getState();

      // Mark as unread if not currently viewing this session
      if (data.sessionId !== store.activeSessionId) {
        if (data.type === 'user-message' || data.type === 'stream-end') {
          useAppStore.getState().markUnread(data.sessionId);
        }
        return;
      }

      switch (data.type) {
        case 'user-message': {
          const userMsg: Message = {
            id: `mcp_user_${Date.now()}`,
            role: 'user',
            content: data.text as string,
            attachments: data.attachments as Array<{ name: string; mimeType: string }>,
            timestamp: Date.now(),
          };
          store.addMessage(userMsg);
          store.setStreaming(true);
          break;
        }
        case 'tool-call': {
          const tc: ToolCallDisplay = {
            id: `mcp_tc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            name: data.name as string,
            args: (data.args as Record<string, unknown>) || {},
            status: 'running',
          };
          store.addToolCall(tc);
          break;
        }
        case 'tool-result': {
          const pending = store.pendingToolCalls;
          const match = [...pending].reverse().find((tc) => tc.name === data.name && tc.status === 'running');
          if (match) {
            store.updateToolResult(match.id, null, undefined, data.duration as number);
          }
          break;
        }
        case 'stream-chunk': {
          store.appendStreamChunk(data.chunk as string);
          break;
        }
        case 'stream-finalize': {
          if (store.streamingText) {
            store.finalizeStream();
            useChatStore.setState({ isStreaming: true });
          }
          break;
        }
        case 'stream-end': {
          store.finalizeStream();
          break;
        }
      }
    });
  }, []);

  const sessionOrigin = useChatStore((s) => s.sessionOrigin);

  const loadSession = useCallback(async (sessionId: string) => {
    useChatStore.getState().setActiveSession(sessionId);
    useAppStore.getState().markRead(sessionId);
    const session = (await window.api.getSession(sessionId)) as Session | null;
    if (!session) return;

    // Track session origin
    useChatStore.setState({ sessionOrigin: (session as Session & { origin?: string }).origin || 'local' });

    const msgs: Message[] = [];
    for (const content of session.messages) {
      if (content.role === 'user') {
        const textPart = content.parts?.find((p) => p.text);
        if (textPart?.text) {
          msgs.push({ id: `user_${msgs.length}`, role: 'user', content: textPart.text, timestamp: Date.now() });
        }
      } else if (content.role === 'model') {
        const textParts = content.parts?.filter((p) => p.text) || [];
        const text = textParts.map((p) => p.text).join('');
        if (text) {
          msgs.push({ id: `model_${msgs.length}`, role: 'model', content: text, timestamp: Date.now() });
        }
      }
    }
    useChatStore.getState().setMessages(msgs);
  }, []);

  const sendMessage = useCallback(
    async (text: string, attachments?: Array<{ base64: string; mimeType: string; name: string }>) => {
      const state = useChatStore.getState();
      if (!state.activeSessionId || state.isStreaming) return;

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: text,
        attachments: attachments?.map((a) => ({ name: a.name, mimeType: a.mimeType })),
        timestamp: Date.now(),
      };
      useChatStore.getState().addMessage(userMessage);
      useChatStore.getState().setStreaming(true);
      useChatStore.getState().setError(null);

      try {
        await window.api.sendMessage(state.activeSessionId, text, attachments);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        useChatStore.getState().setError(msg);
        useChatStore.getState().setStreaming(false);
      }
    },
    [],
  );

  const cancel = useCallback(async () => {
    await window.api.cancelStream();
    // Stop all streaming state immediately
    useChatStore.setState({
      isStreaming: false,
      streamingText: '',
      pendingToolCalls: [],
    });
  }, []);

  return {
    messages,
    isStreaming,
    streamingText,
    pendingToolCalls,
    error,
    activeSessionId,
    sessionOrigin,
    sendMessage,
    cancel,
    loadSession,
  };
}
