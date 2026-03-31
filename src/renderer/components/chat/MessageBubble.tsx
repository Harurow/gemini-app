import React from 'react';
import type { Message } from '../../types/chat';
import { useChatStore } from '../../store/chat-store';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ToolCallBlock } from './ToolCallBlock';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const sessionOrigin = useChatStore((s) => s.sessionOrigin);
  const isMcp = sessionOrigin === 'mcp';

  if (message.role === 'user') {
    const bubbleBg = isMcp ? 'bg-purple-600' : 'bg-blue-600';
    const badgeBg = isMcp ? 'bg-purple-500/80' : 'bg-blue-500/80';

    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%]">
          {/* Attachment badges */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex gap-1.5 justify-end mb-1.5">
              {message.attachments.map((att, i) => (
                <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded-lg ${badgeBg} text-white text-xs`}>
                  {att.mimeType.startsWith('image/') ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                  <span className="truncate max-w-[100px]">{att.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className={`px-4 py-3 rounded-2xl rounded-br-md ${bubbleBg} text-white`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        {message.toolCalls?.map((tc) => (
          <ToolCallBlock key={tc.id} toolCall={tc} />
        ))}
        {message.content && (
          <div className="px-1 py-1">
            <MarkdownRenderer content={message.content} />
          </div>
        )}
      </div>
    </div>
  );
}
