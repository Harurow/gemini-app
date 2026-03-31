import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ApiKeySettings } from './ApiKeySettings';
import { ModelSettings } from './ModelSettings';
import { McpSettings } from './McpSettings';
import { McpServerSettings } from './McpServerSettings';
import { TemplateSettings } from './TemplateSettings';
import { SkillSettings } from './SkillSettings';
import { ThemeSettings } from './ThemeSettings';
import { useI18n } from '../../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'model' | 'templates' | 'skills' | 'theme' | 'mcp' | 'mcpServer' | 'api';

export function SettingsModal({ isOpen, onClose, initialTab }: SettingsModalProps & { initialTab?: TabId }) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab || 'model');
  const { t } = useI18n();

  // initialTab が変わったら反映
  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const tabs: Array<{ id: TabId; labelKey: string }> = [
    { id: 'model', labelKey: 'settings.tab.model' },
    { id: 'templates', labelKey: 'settings.tab.templates' },
    { id: 'skills', labelKey: 'settings.tab.skills' },
    { id: 'theme', labelKey: 'settings.tab.appearance' },
    { id: 'mcp', labelKey: 'settings.tab.mcp' },
    { id: 'mcpServer', labelKey: 'settings.tab.mcpServer' },
    { id: 'api', labelKey: 'settings.tab.apiKey' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')}>
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {activeTab === 'api' && <ApiKeySettings />}
      {activeTab === 'model' && <ModelSettings />}
      {activeTab === 'mcp' && <McpSettings />}
      {activeTab === 'mcpServer' && <McpServerSettings />}
      {activeTab === 'templates' && <TemplateSettings />}
      {activeTab === 'skills' && <SkillSettings />}
      {activeTab === 'theme' && <ThemeSettings />}
    </Modal>
  );
}
