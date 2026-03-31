import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useI18n } from '../../i18n';
import { Button } from '../common/Button';
import { sanitizeWithLimit, isRequired, LIMITS } from '../../utils/validation';

interface Skill {
  id: string;
  name: string;
  description: string;
  steps: string;
  builtIn?: boolean;
  createdBy?: 'user' | 'ai';
  icon?: string;
}

export function SkillSettings() {
  const { settings, updateSettings } = useSettings();
  const { t } = useI18n();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    if ((settings as Record<string, unknown>)?.skills) {
      setSkills((settings as Record<string, unknown>).skills as Skill[]);
    }
  }, [settings]);

  const handleDelete = async (id: string) => {
    const updated = skills.filter((s) => s.id !== id);
    setSkills(updated);
    await updateSettings({ skills: updated } as Record<string, unknown>);
  };

  const handleAdd = () => {
    setEditing({
      id: `skill_${Date.now()}`,
      name: '',
      description: '',
      steps: '',
      createdBy: 'user',
    });
  };

  const handleReset = async () => {
    if (!confirm(t('settings.skills.resetConfirm'))) return;
    const defs = await window.api.getDefaults();
    const defaultSkills = defs.skills as Skill[];
    setSkills(defaultSkills);
    await updateSettings({ skills: defaultSkills } as Record<string, unknown>);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleSaveEdit = async () => {
    if (!editing || !isRequired(editing.name)) return;
    const sanitized: Skill = {
      ...editing,
      name: sanitizeWithLimit(editing.name, LIMITS.name),
      description: sanitizeWithLimit(editing.description, LIMITS.description),
      steps: sanitizeWithLimit(editing.steps, LIMITS.steps),
    };
    const exists = skills.find((s) => s.id === sanitized.id);
    const updated = exists ? skills.map((s) => (s.id === sanitized.id ? sanitized : s)) : [...skills, sanitized];
    setSkills(updated);
    await updateSettings({ skills: updated } as Record<string, unknown>);
    setEditing(null);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const getTag = (skill: Skill) => {
    if (skill.builtIn)
      return { label: t('settings.skills.builtIn'), cls: 'bg-gray-100 dark:bg-gray-800 text-gray-500' };
    if (skill.createdBy === 'ai')
      return {
        label: t('settings.skills.aiCreated'),
        cls: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      };
    return {
      label: t('settings.skills.userCreated'),
      cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    };
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('settings.skills.title')}</label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('settings.skills.description')}</p>
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
        {skills.map((skill) => {
          const tag = getTag(skill);
          const isExpanded = expanded === skill.id;
          return (
            <div key={skill.id} className="rounded-lg border border-gray-200 dark:border-gray-700">
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30"
                onClick={() => setExpanded(isExpanded ? null : skill.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{skill.name}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${tag.cls}`}>{tag.label}</span>
                    <code className="text-[10px] text-gray-400">/{skill.id}</code>
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">{skill.description}</div>
                </div>
                {!skill.builtIn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(skill.id);
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {t('settings.skills.delete')}
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
                  <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded mt-2 whitespace-pre-wrap max-h-[150px] overflow-y-auto scrollbar-thin">
                    {skill.steps}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing ? (
        <div className="p-3 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10 space-y-2">
          <input
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            placeholder={t('settings.skills.name')}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={editing.description}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            placeholder={t('settings.skills.desc')}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={editing.steps}
            onChange={(e) => setEditing({ ...editing, steps: e.target.value })}
            placeholder={t('settings.skills.instruction')}
            rows={5}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleSaveEdit} size="sm" disabled={!isRequired(editing?.name)}>
              {t('settings.apiKey.save')}
            </Button>
            <Button onClick={() => setEditing(null)} variant="ghost" size="sm">
              {t('settings.cancel')}
            </Button>
            {saveStatus === 'saved' && <span className="text-xs text-green-600">{t('settings.saved')}</span>}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button onClick={handleAdd} variant="secondary" size="sm">
            {t('settings.skills.add')}
          </Button>
          <Button onClick={handleReset} variant="ghost" size="sm">
            {t('settings.skills.reset')}
          </Button>
        </div>
      )}
    </div>
  );
}
