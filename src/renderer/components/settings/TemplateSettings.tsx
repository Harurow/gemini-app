import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useI18n } from '../../i18n';
import { Button } from '../common/Button';
import { sanitizeWithLimit, isRequired, LIMITS } from '../../utils/validation';

interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  builtIn?: boolean;
  icon?: string;
}

export function TemplateSettings() {
  const { settings, updateSettings } = useSettings();
  const { t } = useI18n();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Template | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    if (settings?.chatTemplates) {
      const migrated = (settings.chatTemplates as Array<Record<string, unknown>>).map((tp) => ({
        ...tp,
        prompt: (tp.prompt || tp.systemInstruction || '') as string,
      })) as Template[];
      setTemplates(migrated);
    }
  }, [settings]);

  const handleDelete = async (id: string) => {
    const updated = templates.filter((tp) => tp.id !== id);
    setTemplates(updated);
    await updateSettings({ chatTemplates: updated });
  };

  const handleAdd = () => {
    setEditing({ id: `template_${Date.now()}`, name: '', description: '', prompt: '' });
    setExpanded(null);
  };

  const handleReset = async () => {
    if (!confirm(t('settings.templates.resetConfirm'))) return;
    try {
      const defs = await window.api.getDefaults();
      const defaultTemplates = defs.chatTemplates as Template[];
      await updateSettings({ chatTemplates: defaultTemplates });
      setTemplates(defaultTemplates);
      setEditing(null);
      setExpanded(null);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error('Reset failed:', e);
    }
  };

  const handleSaveEdit = async () => {
    if (!editing || !isRequired(editing.name)) return;
    const sanitized: Template = {
      ...editing,
      name: sanitizeWithLimit(editing.name, LIMITS.name),
      description: sanitizeWithLimit(editing.description, LIMITS.description),
      prompt: sanitizeWithLimit(editing.prompt, LIMITS.prompt),
    };
    const exists = templates.find((tp) => tp.id === sanitized.id);
    const updated = exists
      ? templates.map((tp) => (tp.id === sanitized.id ? sanitized : tp))
      : [...templates, sanitized];
    setTemplates(updated);
    await updateSettings({ chatTemplates: updated });
    setEditing(null);
    setExpanded(null);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const isNewTemplate = editing && !templates.some((tp) => tp.id === editing.id);

  const renderEditForm = (tp: Template) => (
    <div className="space-y-2 mt-2">
      <input
        value={tp.name}
        onChange={(e) => setEditing({ ...tp, name: e.target.value })}
        placeholder={t('settings.templates.name')}
        maxLength={LIMITS.name}
        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        value={tp.description}
        onChange={(e) => setEditing({ ...tp, description: e.target.value })}
        placeholder={t('settings.templates.desc')}
        maxLength={LIMITS.description}
        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        value={tp.prompt}
        onChange={(e) => setEditing({ ...tp, prompt: e.target.value })}
        placeholder={t('settings.templates.prompt')}
        maxLength={LIMITS.prompt}
        rows={4}
        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center gap-2">
        <Button onClick={handleSaveEdit} size="sm" disabled={!isRequired(tp.name)}>
          {t('settings.apiKey.save')}
        </Button>
        <Button onClick={() => setEditing(null)} variant="ghost" size="sm">
          {t('settings.cancel')}
        </Button>
        {saveStatus === 'saved' && <span className="text-xs text-green-600">{t('settings.saved')}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('settings.templates.title')}</label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('settings.templates.description')}</p>
      </div>

      {/* Template list — expand to view/edit (same pattern as SkillSettings) */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
        {templates.map((tp) => {
          const isExpanded = expanded === tp.id;
          const isEditing = editing?.id === tp.id;
          return (
            <div key={tp.id} className="rounded-lg border border-gray-200 dark:border-gray-700">
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30"
                onClick={() => {
                  setExpanded(isExpanded ? null : tp.id);
                  if (!isExpanded) setEditing(null);
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {tp.builtIn ? t(`settings.templates.builtin.${tp.id}.name`) : tp.name}
                    </span>
                    {tp.builtIn && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                        {t('settings.templates.builtIn')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {tp.builtIn
                      ? t(`settings.templates.builtin.${tp.id}.desc`)
                      : tp.description || (tp.prompt || '').slice(0, 60)}
                  </div>
                </div>
                {!tp.builtIn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(tp.id);
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {t('settings.templates.delete')}
                  </button>
                )}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-800">
                  {isEditing ? (
                    renderEditForm(editing!)
                  ) : (
                    <>
                      <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded mt-2 whitespace-pre-wrap max-h-[120px] overflow-y-auto scrollbar-thin">
                        {tp.builtIn
                          ? t(`settings.templates.builtin.${tp.id}.prompt`) === '(none)'
                            ? '(empty)'
                            : t(`settings.templates.builtin.${tp.id}.prompt`)
                          : tp.prompt || '(empty)'}
                      </pre>
                      <button
                        onClick={() => setEditing({ ...tp })}
                        className="text-xs text-blue-500 hover:text-blue-600 mt-2"
                      >
                        {t('settings.templates.edit')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New template form */}
      {isNewTemplate ? (
        <div className="p-3 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10">
          {renderEditForm(editing!)}
        </div>
      ) : (
        !editing && (
          <div className="flex gap-2">
            <Button onClick={handleAdd} variant="secondary" size="sm">
              {t('settings.templates.add')}
            </Button>
            <Button onClick={handleReset} variant="ghost" size="sm">
              {t('settings.templates.reset')}
            </Button>
          </div>
        )
      )}
    </div>
  );
}
