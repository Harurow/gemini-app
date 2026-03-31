import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '../../store/app-store';
import { useI18n } from '../../i18n';

export interface FileAttachment {
  name: string;
  mimeType: string;
  base64: string;
  preview?: string; // data URL for image preview
  size: number;
}

interface ChatInputProps {
  onSend: (message: string, attachments?: FileAttachment[]) => void;
  onCancel: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'text/html',
  'application/json',
  'application/xml',
];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function ChatInput({ onSend, onCancel, isStreaming, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const [sendCount, setSendCount] = useState(0);
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  const [skillMenuIndex, setSkillMenuIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const settings = useAppStore((s) => s.settings);
  const { t } = useI18n();

  // Skill autocomplete
  const skills = useMemo(() => {
    const all =
      ((settings as Record<string, unknown>)?.skills as Array<{ id: string; name: string; description: string }>) || [];
    if (!text.startsWith('/')) return [];
    const query = text.slice(1).toLowerCase();
    return all.filter((s) => s.id.includes(query) || s.name.toLowerCase().includes(query));
  }, [text, settings]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  // Open/close skill menu based on text
  useEffect(() => {
    if (text.startsWith('/') && skills.length > 0) {
      setSkillMenuOpen(true);
      setSkillMenuIndex(0);
    } else {
      setSkillMenuOpen(false);
    }
  }, [text, skills.length]);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const newAttachments: FileAttachment[] = [];

      for (const file of Array.from(files)) {
        const mimeType = file.type || guessMimeType(file.name);
        if (!ACCEPTED_TYPES.includes(mimeType) && !mimeType.startsWith('text/')) continue;
        if (file.size > MAX_FILE_SIZE) {
          alert(t('chat.fileTooBig'));
          continue;
        }

        const base64 = await fileToBase64(file);
        const att: FileAttachment = {
          name: file.name,
          mimeType,
          base64,
          size: file.size,
        };

        // Generate preview for images
        if (mimeType.startsWith('image/')) {
          att.preview = `data:${mimeType};base64,${base64}`;
        }

        newAttachments.push(att);
      }

      if (newAttachments.length > 0) {
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
    },
    [t],
  );

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || isStreaming || disabled) return;
    const msg = trimmed || '(attached files)';
    const atts = attachments.length > 0 ? [...attachments] : undefined;
    // Send first, then clear
    onSend(msg, atts);
    // Force clear by incrementing key (remounts textarea)
    setSendCount((c) => c + 1);
    setText('');
    setAttachments([]);
  };

  const selectSkill = (skillId: string) => {
    setText(`/${skillId} `);
    setSkillMenuOpen(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (skillMenuOpen && skills.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSkillMenuIndex((i) => (i + 1) % skills.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSkillMenuIndex((i) => (i - 1 + skills.length) % skills.length);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        selectSkill(skills[skillMenuIndex].id);
        return;
      }
      if (e.key === 'Escape') {
        setSkillMenuOpen(false);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the drop zone entirely
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Also handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (const item of Array.from(items)) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      processFiles(files);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div
      ref={dropRef}
      className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drop overlay */}
      {dragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-50/90 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 rounded-xl m-2">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('chat.dropHere')}</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {attachments.map((att, i) => (
              <div key={i} className="relative group">
                {att.preview ? (
                  <img
                    src={att.preview}
                    alt={att.name}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
                    <svg
                      className={`w-5 h-5 ${att.mimeType === 'application/pdf' ? 'text-red-500' : 'text-blue-500'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 3.5L18.5 8H14V3.5zM6 20V4h7v5h5v11H6z" />
                    </svg>
                    <span className="text-[9px] text-gray-500 mt-0.5 truncate max-w-[56px]">
                      {att.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="text-[9px] text-gray-400 mt-0.5 truncate w-16 text-center">{formatSize(att.size)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Skill autocomplete dropdown */}
        {skillMenuOpen && skills.length > 0 && (
          <div className="mb-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden max-h-[200px] overflow-y-auto">
            {skills.map((skill, i) => (
              <button
                key={skill.id}
                onClick={() => selectSkill(skill.id)}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm transition-colors ${
                  i === skillMenuIndex
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <code className="text-xs text-gray-400 font-mono">/{skill.id}</code>
                <span className="font-medium">{skill.name}</span>
                <span className="text-xs text-gray-400 truncate">{skill.description}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          {/* Attach button */}
          <button
            onClick={handleFileSelect}
            disabled={isStreaming || disabled}
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            title={t('chat.attach')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept={[
              ...ACCEPTED_TYPES,
              '.md',
              '.txt',
              '.csv',
              '.json',
              '.yaml',
              '.yml',
              '.js',
              '.ts',
              '.py',
              '.sql',
              '.sh',
            ].join(',')}
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <textarea
            key={sendCount}
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={t('chat.placeholder')}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm leading-normal py-1.5 max-h-[200px] placeholder-gray-400 dark:placeholder-gray-500"
          />
          {isStreaming ? (
            <button
              onClick={onCancel}
              className="flex-shrink-0 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              title={t('chat.stop')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={(!text.trim() && attachments.length === 0) || disabled}
              className="flex-shrink-0 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={t('chat.send')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">{t('chat.disclaimer')}</p>
      </div>
    </div>
  );
}

function guessMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    md: 'text/markdown',
    markdown: 'text/markdown',
    txt: 'text/plain',
    text: 'text/plain',
    log: 'text/plain',
    csv: 'text/csv',
    tsv: 'text/csv',
    html: 'text/html',
    htm: 'text/html',
    json: 'application/json',
    xml: 'application/xml',
    yaml: 'text/plain',
    yml: 'text/plain',
    js: 'text/plain',
    ts: 'text/plain',
    tsx: 'text/plain',
    jsx: 'text/plain',
    py: 'text/plain',
    rb: 'text/plain',
    go: 'text/plain',
    rs: 'text/plain',
    java: 'text/plain',
    kt: 'text/plain',
    swift: 'text/plain',
    c: 'text/plain',
    cpp: 'text/plain',
    h: 'text/plain',
    sh: 'text/plain',
    bash: 'text/plain',
    zsh: 'text/plain',
    sql: 'text/plain',
    toml: 'text/plain',
    ini: 'text/plain',
    cfg: 'text/plain',
    css: 'text/plain',
    scss: 'text/plain',
  };
  return map[ext || ''] || 'application/octet-stream';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (data:image/png;base64,)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
