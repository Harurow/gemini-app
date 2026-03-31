import React, { useEffect, useRef } from 'react';
import type { Message, ToolCallDisplay } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { StreamingMessage } from './StreamingMessage';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  streamingText: string;
  pendingToolCalls: ToolCallDisplay[];
}

export function MessageList({ messages, isStreaming, streamingText, pendingToolCalls }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, pendingToolCalls]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && <StreamingMessage text={streamingText} toolCalls={pendingToolCalls} />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
