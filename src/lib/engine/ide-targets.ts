// =============================================
// Initra — IDE Target Configurations
// =============================================

import { IDETargetConfig } from './types';

export const IDE_TARGETS: IDETargetConfig[] = [
  {
    slug: 'claude-code',
    name: 'Claude Code',
    icon: '🟣',
    configFilename: 'CLAUDE.md',
    configPath: 'CLAUDE.md',
    description: 'Claude Code agent context file. Loaded automatically at session start.',
    supportsMultiFile: false,
  },
  {
    slug: 'cursor',
    name: 'Cursor',
    icon: '⚡',
    configFilename: 'project-context.mdc',
    configPath: '.cursor/rules/project-context.mdc',
    description: 'Cursor rules with YAML frontmatter. Supports glob patterns and auto-apply.',
    supportsMultiFile: true,
  },
  {
    slug: 'windsurf',
    name: 'Windsurf',
    icon: '🌊',
    configFilename: 'project-context.md',
    configPath: '.windsurf/rules/project-context.md',
    description: 'Windsurf workspace rules in Markdown format.',
    supportsMultiFile: true,
  },
  {
    slug: 'gemini',
    name: 'Gemini',
    icon: '💎',
    configFilename: 'GEMINI.md',
    configPath: 'GEMINI.md',
    description: 'Gemini CLI/IDE agent instructions. Hierarchical loading from root.',
    supportsMultiFile: false,
  },
  {
    slug: 'copilot',
    name: 'GitHub Copilot',
    icon: '🐙',
    configFilename: 'copilot-instructions.md',
    configPath: '.github/copilot-instructions.md',
    description: 'GitHub Copilot agent instructions. Applied to all Copilot interactions.',
    supportsMultiFile: false,
  },
  {
    slug: 'universal',
    name: 'Universal (AGENTS.md)',
    icon: '🌐',
    configFilename: 'AGENTS.md',
    configPath: 'AGENTS.md',
    description: 'Tool-agnostic open standard. Works across multiple AI coding agents.',
    supportsMultiFile: false,
  },
];

export function getIDETarget(slug: string): IDETargetConfig | undefined {
  return IDE_TARGETS.find((t) => t.slug === slug);
}
