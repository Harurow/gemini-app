import { create } from 'zustand';
import type { Message, ToolCallDisplay } from '../types/chat';

export interface UsageInfo {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  apiCalls: number;
}

interface ChatState {
  activeSessionId: string | null;
  messages: Message[];
  isStreaming: boolean;
  streamingText: string;
  pendingToolCalls: ToolCallDisplay[];
  error: string | null;
  usage: UsageInfo | null;

  setActiveSession: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  appendStreamChunk: (chunk: string) => void;
  setStreaming: (streaming: boolean) => void;
  finalizeStream: () => void;
  addToolCall: (tc: ToolCallDisplay) => void;
  updateToolResult: (id: string, result: unknown, error?: string, duration?: number) => void;
  setError: (error: string | null) => void;
  setUsage: (usage: UsageInfo) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeSessionId: null,
  messages: [],
  isStreaming: false,
  streamingText: '',
  pendingToolCalls: [],
  error: null,
  usage: null,

  setActiveSession: (id) => set({ activeSessionId: id, messages: [], error: null, usage: null }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),

  appendStreamChunk: (chunk) => set((s) => ({ streamingText: s.streamingText + chunk })),

  setStreaming: (streaming) =>
    set({
      isStreaming: streaming,
      ...(streaming ? { streamingText: '', pendingToolCalls: [] } : {}),
    }),

  finalizeStream: () => {
    const { streamingText, pendingToolCalls, messages } = get();
    if (streamingText || pendingToolCalls.length > 0) {
      const newMessage: Message = {
        id: `model_${Date.now()}`,
        role: 'model',
        content: streamingText,
        toolCalls: pendingToolCalls.length > 0 ? [...pendingToolCalls] : undefined,
        timestamp: Date.now(),
      };
      set({
        messages: [...messages, newMessage],
        streamingText: '',
        pendingToolCalls: [],
        isStreaming: false,
      });
    } else {
      set({ isStreaming: false });
    }
  },

  addToolCall: (tc) =>
    set((s) => {
      // When a tool call arrives, finalize any pending text as a message
      const updates: Partial<ChatState> = {
        pendingToolCalls: [...s.pendingToolCalls, tc],
      };

      if (s.streamingText) {
        const textMsg: Message = {
          id: `model_${Date.now()}`,
          role: 'model',
          content: s.streamingText,
          timestamp: Date.now(),
        };
        updates.messages = [...s.messages, textMsg];
        updates.streamingText = '';
      }

      return updates;
    }),

  updateToolResult: (id, result, error, duration) =>
    set((s) => ({
      pendingToolCalls: s.pendingToolCalls.map((tc) =>
        tc.id === id
          ? { ...tc, status: error ? ('error' as const) : ('completed' as const), result, error, duration }
          : tc,
      ),
    })),

  setError: (error) => set({ error }),

  setUsage: (usage) => set({ usage }),

  reset: () =>
    set({
      activeSessionId: null,
      messages: [],
      isStreaming: false,
      streamingText: '',
      pendingToolCalls: [],
      error: null,
      usage: null,
    }),
}));
