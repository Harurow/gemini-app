import { describe, it, expect, beforeEach } from 'vitest';

// Test the chat store logic (pure state management, no React)
// We import the store factory directly
import { useChatStore } from '../renderer/store/chat-store';

describe('ChatStore', () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it('initial state', () => {
    const state = useChatStore.getState();
    expect(state.activeSessionId).toBeNull();
    expect(state.messages).toEqual([]);
    expect(state.isStreaming).toBe(false);
    expect(state.streamingText).toBe('');
    expect(state.error).toBeNull();
    expect(state.usage).toBeNull();
  });

  it('setActiveSession clears messages and error', () => {
    useChatStore.getState().addMessage({ id: '1', role: 'user', content: 'test', timestamp: 1 });
    useChatStore.getState().setError('some error');
    useChatStore.getState().setActiveSession('session-1');

    const state = useChatStore.getState();
    expect(state.activeSessionId).toBe('session-1');
    expect(state.messages).toEqual([]);
    expect(state.error).toBeNull();
  });

  it('addMessage appends to messages', () => {
    useChatStore.getState().addMessage({ id: '1', role: 'user', content: 'hello', timestamp: 1 });
    useChatStore.getState().addMessage({ id: '2', role: 'model', content: 'hi', timestamp: 2 });

    expect(useChatStore.getState().messages).toHaveLength(2);
    expect(useChatStore.getState().messages[0].content).toBe('hello');
    expect(useChatStore.getState().messages[1].content).toBe('hi');
  });

  it('appendStreamChunk accumulates text', () => {
    useChatStore.getState().appendStreamChunk('hello ');
    useChatStore.getState().appendStreamChunk('world');

    expect(useChatStore.getState().streamingText).toBe('hello world');
  });

  it('finalizeStream moves streaming text to messages', () => {
    useChatStore.getState().setStreaming(true);
    useChatStore.getState().appendStreamChunk('response text');
    useChatStore.getState().finalizeStream();

    const state = useChatStore.getState();
    expect(state.isStreaming).toBe(false);
    expect(state.streamingText).toBe('');
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].content).toBe('response text');
    expect(state.messages[0].role).toBe('model');
  });

  it('setUsage updates usage info', () => {
    useChatStore.getState().setUsage({
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      apiCalls: 1,
    });

    expect(useChatStore.getState().usage).toEqual({
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      apiCalls: 1,
    });
  });

  it('reset clears all state', () => {
    useChatStore.getState().setActiveSession('s1');
    useChatStore.getState().addMessage({ id: '1', role: 'user', content: 'x', timestamp: 1 });
    useChatStore.getState().setStreaming(true);
    useChatStore.getState().setError('err');
    useChatStore.getState().setUsage({ inputTokens: 1, outputTokens: 1, totalTokens: 2, apiCalls: 1 });
    useChatStore.getState().reset();

    const state = useChatStore.getState();
    expect(state.activeSessionId).toBeNull();
    expect(state.messages).toEqual([]);
    expect(state.isStreaming).toBe(false);
    expect(state.error).toBeNull();
    expect(state.usage).toBeNull();
  });
});
