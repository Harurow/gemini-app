import React, { useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useChatStore } from '../../store/chat-store';
import { useI18n } from '../../i18n';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

function UsageBar() {
  const usage = useChatStore((s) => s.usage);
  const { t } = useI18n();
  if (!usage) return null;

  return (
    <div className="flex justify-center gap-4 px-4 py-1 text-[10px] text-gray-400 dark:text-gray-600">
      <span>
        {t('chat.usage.apiCalls')}: {usage.apiCalls}
      </span>
      <span>
        {t('chat.usage.input')}: {usage.inputTokens.toLocaleString()}
      </span>
      <span>
        {t('chat.usage.output')}: {usage.outputTokens.toLocaleString()}
      </span>
      <span>
        {t('chat.usage.total')}: {usage.totalTokens.toLocaleString()}
      </span>
    </div>
  );
}

export function ChatView() {
  const {
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
  } = useChat();

  const isMcpSession = sessionOrigin === 'mcp';

  useEffect(() => {
    if (activeSessionId) {
      loadSession(activeSessionId);
    }
  }, [activeSessionId, loadSession]);

  // Escape key cancels streaming/skill execution
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStreaming) {
        cancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isStreaming, cancel]);

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="mx-4 mt-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm whitespace-pre-wrap">
          {error}
        </div>
      )}

      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        streamingText={streamingText}
        pendingToolCalls={pendingToolCalls}
      />

      <UsageBar />

      {!isMcpSession && <ChatInput onSend={sendMessage} onCancel={cancel} isStreaming={isStreaming} />}
    </div>
  );
}
