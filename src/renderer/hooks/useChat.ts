import { useEffect, useCallback, useRef } from 'react';
import { useChatStore } from '../store/chat-store';
import type { Message, ToolCallDisplay, Session } from '../types/chat';

export function useChat() {
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingText = useChatStore((s) => s.streamingText);
  const pendingToolCalls = useChatStore((s) => s.pendingToolCalls);
  const error = useChatStore((s) => s.error);
  const listenersRegistered = useRef(false);

  useEffect(() => {
    if (listenersRegistered.current) return;
    listenersRegistered.current = true;

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
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    useChatStore.getState().setActiveSession(sessionId);
    const session = (await window.api.getSession(sessionId)) as Session | null;
    if (!session) return;

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
    sendMessage,
    cancel,
    loadSession,
  };
}
