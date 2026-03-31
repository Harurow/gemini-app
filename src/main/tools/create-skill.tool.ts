import type { ToolDefinition } from './tool-types';
import { getSettings, updateSettings, type Skill } from '../store';

export const createSkillTool: ToolDefinition = {
  declaration: {
    name: 'create_skill',
    description:
      'Create a new reusable skill (automated workflow). Skills are step-by-step procedures that can be invoked with /skill-name during chat. Each skill defines what tools to use and in what order.',
    parameters: {
      type: 'OBJECT' as const,
      properties: {
        name: {
          type: 'STRING' as const,
          description: 'Short name for the skill (e.g., "SQL Analysis", "PR Review")',
        },
        description: {
          type: 'STRING' as const,
          description: 'Brief description of what this skill does',
        },
        steps: {
          type: 'STRING' as const,
          description:
            'Markdown-formatted step-by-step procedure. Include which tools to use (read_file, run_shell_command, google_web_search, etc.)',
        },
      },
      required: ['name', 'description', 'steps'],
    },
  },

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const name = String(args.name);
    const description = String(args.description);
    const steps = String(args.steps);

    const id = `skill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newSkill: Skill = {
      id,
      name,
      description,
      steps,
      createdBy: 'ai',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    };

    const settings = getSettings();
    const skills = [...(settings.skills || []), newSkill];
    updateSettings({ skills });

    return {
      created: true,
      skill: { id, name, description },
      message: `スキル「${name}」を作成しました。チャットで /${id} と入力すると実行できます。`,
    };
  },
};
