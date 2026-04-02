import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useI18n } from '../../i18n';
import { Button } from '../common/Button';

interface ModelInfo {
  id: string;
  name: string;
  desc: { ja: string; en: string };
  tag?: 'preview' | 'stable';
}

const MODELS: ModelInfo[] = [
  {
    id: 'auto',
    name: 'Auto',
    desc: {
      ja: '内容に応じて Pro / Flash を自動選択 (推奨)',
      en: 'Auto-routes between Pro / Flash based on complexity (Recommended)',
    },
    tag: 'stable',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    desc: {
      ja: '最高性能。複雑な推論・エージェント向け (1M context)',
      en: 'Most capable. Complex reasoning & agents (1M context)',
    },
    tag: 'preview',
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    desc: {
      ja: 'Pro 級の性能を Flash 価格で提供 (1M context)',
      en: 'Pro-level performance at Flash pricing (1M context)',
    },
    tag: 'preview',
  },
  {
    id: 'gemini-3.1-flash-lite-preview',
    name: 'Gemini 3.1 Flash Lite',
    desc: { ja: '最もコスト効率が良いモデル (1M context)', en: 'Most cost-efficient model (1M context)' },
    tag: 'preview',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    desc: { ja: '高度な推論・コーディング能力 (安定版)', en: 'Advanced reasoning & coding (Stable)' },
    tag: 'stable',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    desc: { ja: '高速で効率的。Thinking 機能搭載 (安定版)', en: 'Fast & efficient with thinking (Stable)' },
    tag: 'stable',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    desc: { ja: '大量バッチ処理向け。最速・最安 (安定版)', en: 'For batch processing. Fastest & cheapest (Stable)' },
    tag: 'stable',
  },
];

const tagStyles = {
  preview: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  stable: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
};
const tagLabels = {
  preview: { ja: 'Preview', en: 'Preview' },
  stable: { ja: '安定版', en: 'Stable' },
};

export function ModelSettings() {
  const { settings, updateSettings } = useSettings();
  const { t, locale } = useI18n();
  const [model, setModel] = useState(settings?.defaultModel || 'gemini-2.5-flash');
  const [systemInstruction, setSystemInstruction] = useState(settings?.systemInstruction || '');
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    if (settings) {
      setModel(settings.defaultModel);
      setSystemInstruction(settings.systemInstruction);
    }
  }, [settings]);

  // Auto-save model selection immediately
  const handleModelChange = async (newModel: string) => {
    setModel(newModel);
    await updateSettings({ defaultModel: newModel });
  };

  // Auto-save system instruction with debounce
  const handleSystemInstructionChange = (value: string) => {
    setSystemInstruction(value);
    if (saveTimer) clearTimeout(saveTimer);
    setSaveTimer(
      setTimeout(() => {
        updateSettings({ systemInstruction: value });
      }, 800),
    );
  };

  // Save on blur too
  const handleSystemInstructionBlur = () => {
    if (saveTimer) clearTimeout(saveTimer);
    updateSettings({ systemInstruction: systemInstruction });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">{t('settings.model.title')}</label>
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
          {MODELS.map((m) => (
            <label
              key={m.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                model === m.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <input
                type="radio"
                name="model"
                value={m.id}
                checked={model === m.id}
                onChange={() => handleModelChange(m.id)}
                className="text-blue-600 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{m.name}</span>
                  {m.tag && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${tagStyles[m.tag]}`}>
                      {tagLabels[m.tag][locale]}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{m.desc[locale]}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('settings.model.systemInstruction')}</label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('settings.model.systemInstruction.desc')}</p>
        <textarea
          value={systemInstruction}
          onChange={(e) => handleSystemInstructionChange(e.target.value)}
          onBlur={handleSystemInstructionBlur}
          placeholder={t('settings.model.systemInstruction.placeholder')}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={async () => {
            await updateSettings({ defaultModel: model, systemInstruction });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
          }}
          size="sm"
        >
          {t('settings.apiKey.save')}
        </Button>
        {saveStatus === 'saved' && <span className="text-xs text-green-600">{t('settings.saved')}</span>}
      </div>
    </div>
  );
}
