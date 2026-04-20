// =============================================
// Initra — IDE Formatter
// Transforms composed content into IDE-specific formats
// Now with rich framework-specific knowledge injection
// =============================================

import { IDETarget, GeneratedFile, TemplateVariables } from './types';
import { compose } from './prompt-composer';
import { getFrameworkKnowledge } from './framework-knowledge';
import { getPackageDefinition } from './package-library';

/**
 * Format the generated content for a specific IDE target.
 * Each IDE has its own file format, path, and structure requirements.
 */
export function formatForIDE(
  ideTarget: IDETarget,
  variables: TemplateVariables,
  baseContent: string
): GeneratedFile[] {
  switch (ideTarget) {
    case 'claude-code':
      return formatClaudeCode(variables, baseContent);
    case 'cursor':
      return formatCursor(variables, baseContent);
    case 'windsurf':
      return formatWindsurf(variables, baseContent);
    case 'gemini':
      return formatGemini(variables, baseContent);
    case 'copilot':
      return formatCopilot(variables, baseContent);
    case 'universal':
      return formatUniversal(variables, baseContent);
    default:
      return formatUniversal(variables, baseContent);
  }
}

// ── Knowledge Injection Helpers ─────────────────

function getKnowledgeBlocks(vars: TemplateVariables) {
  const slug = String(vars.framework || '');
  const knowledge = getFrameworkKnowledge(slug);
  if (!knowledge) return null;

  const stackRules = knowledge.getStackSpecificRules?.(vars) || '';

  return {
    fileStructure: knowledge.fileStructure,
    antiPatterns: knowledge.antiPatterns,
    codePatterns: knowledge.codePatterns,
    conventions: knowledge.conventions,
    stackRules,
  };
}

/**
 * Appends a "## Packages" section to content for each selected package.
 * Includes install command, setup snippet, usage, conventions, and anti-patterns.
 */
function injectPackageKnowledge(content: string, vars: TemplateVariables): string {
  const pkgSlugs = vars.selectedPackages ?? [];
  if (!pkgSlugs.length) return content;

  const sections: string[] = [];

  for (const slug of pkgSlugs) {
    const pkg = getPackageDefinition(slug);
    if (!pkg) continue;

    let section = `### ${pkg.name}`;

    // package badge
    const badge = pkg.npmPackage ?? pkg.pyPackage ?? pkg.pubPackage;
    if (badge) section += `\n> \`${badge}\``;

    if (pkg.knowledge.installCommand) {
      section += `\n\n**Install:** \`${pkg.knowledge.installCommand}\``;
    }
    if (pkg.knowledge.setupSnippet) {
      section += `\n\n**Setup:**\n${pkg.knowledge.setupSnippet}`;
    }
    if (pkg.knowledge.usageSnippet) {
      section += `\n\n**Usage:**\n${pkg.knowledge.usageSnippet}`;
    }
    if (pkg.knowledge.conventions?.length) {
      section += `\n\n**Conventions:**\n`;
      section += pkg.knowledge.conventions.map(c => `- ${c}`).join('\n');
    }
    if (pkg.knowledge.antiPatterns?.length) {
      section += `\n\n**Anti-Patterns:**\n`;
      section += pkg.knowledge.antiPatterns.map(a => `- ${a}`).join('\n');
    }

    sections.push(section);
  }

  if (!sections.length) return content;

  return content + `\n\n## Packages\n\n${sections.join('\n\n---\n\n')}`;
}

// ── Claude Code ─────────────────────────────────

function formatClaudeCode(vars: TemplateVariables, _base: string): GeneratedFile[] {
  const kb = getKnowledgeBlocks(vars);

  const template = `# {{projectName}}

> {{framework}} application built with {{languageLabel}}.

## Commands
- \`{{devCommand}}\` — Start development server
- \`{{buildCommand}}\` — Production build
{{#if testing}}
- \`{{testCommand}}\` — Run tests
{{/if}}
{{#if dbPushCommand}}
- \`{{dbPushCommand}}\` — Push database changes
{{/if}}
- \`{{installCommand}}\` — Install dependencies

## Tech Stack
- **Framework**: {{framework}}
- **Language**: {{languageLabel}}
{{#if styling}}
- **Styling**: {{styling}}
{{/if}}
{{#if database}}
- **Database**: {{database}}
{{/if}}
{{#if auth}}
- **Auth**: {{auth}}
{{/if}}
{{#if stateManagement}}
- **State**: {{stateManagement}}
{{/if}}
{{#if testing}}
- **Testing**: {{testing}}
{{/if}}
{{#if deployment}}
- **Deployment**: {{deployment}}
{{/if}}`;

  let content = compose(template, vars);

  // Inject framework-specific knowledge
  if (kb) {
    content += `\n\n## Project Structure\n\n${kb.fileStructure}`;

    content += `\n\n## Anti-Patterns — DO NOT\n\n`;
    content += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    content += `\n\n## Conventions\n\n`;
    content += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    content += `\n\n## Code Patterns\n\n${kb.codePatterns}`;

    if (kb.stackRules) {
      content += `\n\n## Stack-Specific Rules\n\n${kb.stackRules}`;
    }
  }

  // Inject selected package knowledge
  content = injectPackageKnowledge(content, vars);

  // Always include guardrails
  content += `\n\n## Guardrails
- Never delete or modify migration files without asking.
- Never commit .env or secret files.
- Never install new dependencies without asking first.
- Always check existing patterns before creating new utilities.
- Always run the linter before committing.`;

  return [{
    ideTarget: 'claude-code',
    filename: 'CLAUDE.md',
    filePath: 'CLAUDE.md',
    content,
  }];
}

// ── Cursor ──────────────────────────────────────

function formatCursor(vars: TemplateVariables, _base: string): GeneratedFile[] {
  const kb = getKnowledgeBlocks(vars);

  // File 1: Project Context
  const contextTemplate = `---
description: Project architecture and conventions for {{projectName}}
alwaysApply: true
---
# {{projectName}} — Project Context

> {{framework}} application using {{languageLabel}}.

## Tech Stack
| Component | Technology |
|-----------|-----------|
| Framework | {{framework}} |
| Language | {{languageLabel}} |
{{#if styling}}
| Styling | {{styling}} |
{{/if}}
{{#if database}}
| Database | {{database}} |
{{/if}}
{{#if auth}}
| Auth | {{auth}} |
{{/if}}
{{#if stateManagement}}
| State | {{stateManagement}} |
{{/if}}
{{#if testing}}
| Testing | {{testing}} |
{{/if}}
{{#if deployment}}
| Deploy | {{deployment}} |
{{/if}}

## Commands
- Dev: \`{{devCommand}}\`
- Build: \`{{buildCommand}}\`
{{#if testing}}
- Test: \`{{testCommand}}\`
{{/if}}
{{#if dbPushCommand}}
- DB Push: \`{{dbPushCommand}}\`
{{/if}}`;

  let contextContent = compose(contextTemplate, vars);

  if (kb) {
    contextContent += `\n\n## Project Structure\n\n${kb.fileStructure}`;

    if (kb.stackRules) {
      contextContent += `\n\n${kb.stackRules}`;
    }
  }

  // Inject selected package knowledge into the context file
  contextContent = injectPackageKnowledge(contextContent, vars);

  contextContent += `\n\n## Boundaries
- Never modify migration files without asking.
- Never commit .env files.
- Ask before installing new dependencies.
- Check existing patterns before creating new code.`;

  // File 2: Coding Standards (with anti-patterns and code patterns)
  let codingContent = `---
description: Coding standards, anti-patterns, and preferred patterns
alwaysApply: true
---
# Coding Standards`;

  if (kb) {
    codingContent += `\n\n## Anti-Patterns — NEVER Do This\n\n`;
    codingContent += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    codingContent += `\n\n## Conventions\n\n`;
    codingContent += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    codingContent += `\n\n## Preferred Patterns\n\n${kb.codePatterns}`;
  } else {
    codingContent += `\n\n## Style Rules
{{#if language}}
- Language: {{languageLabel}} with strict typing enabled
- No \`any\` types — always provide explicit type annotations
{{/if}}
- Use \`const\` by default, \`let\` only when reassignment is needed
- Prefer template literals over string concatenation
- Use optional chaining (\`?.\`) and nullish coalescing (\`??\`)

## Error Handling
- Always handle errors explicitly — never silently catch and ignore
- Use typed error classes for domain errors
- Log errors with sufficient context for debugging

## File Organization
- One component/module per file
- Group related files in feature directories
- Keep imports organized: external → internal → relative`;
    codingContent = compose(codingContent, vars);
  }

  return [
    {
      ideTarget: 'cursor',
      filename: 'project-context.mdc',
      filePath: '.cursor/rules/project-context.mdc',
      content: contextContent,
    },
    {
      ideTarget: 'cursor',
      filename: 'coding-standards.mdc',
      filePath: '.cursor/rules/coding-standards.mdc',
      content: codingContent,
    },
  ];
}

// ── Windsurf ────────────────────────────────────

function formatWindsurf(vars: TemplateVariables, _base: string): GeneratedFile[] {
  const kb = getKnowledgeBlocks(vars);

  const template = `# {{projectName}} — Project Rules

## Overview
This is a {{framework}} project using {{languageLabel}}.

## Tech Stack
- Framework: {{framework}}
- Language: {{languageLabel}}
{{#if styling}}
- Styling: {{styling}}
{{/if}}
{{#if database}}
- Database: {{database}}
{{/if}}
{{#if auth}}
- Auth: {{auth}}
{{/if}}
{{#if stateManagement}}
- State Management: {{stateManagement}}
{{/if}}
{{#if testing}}
- Testing: {{testing}}
{{/if}}

## Development Commands
- Start dev server: \`{{devCommand}}\`
- Build for production: \`{{buildCommand}}\`
{{#if testing}}
- Run tests: \`{{testCommand}}\`
{{/if}}
{{#if dbPushCommand}}
- Push DB changes: \`{{dbPushCommand}}\`
{{/if}}`;

  let content = compose(template, vars);

  if (kb) {
    content += `\n\n## Project Structure\n\n${kb.fileStructure}`;

    content += `\n\n## Do NOT — Anti-Patterns\n\n`;
    content += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    content += `\n\n## Conventions\n\n`;
    content += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    content += `\n\n## Code Patterns\n\n${kb.codePatterns}`;

    if (kb.stackRules) {
      content += `\n\n${kb.stackRules}`;
    }
  }

  content = injectPackageKnowledge(content, vars);

  content += `\n\n## Guardrails
- Do not modify migration files without explicit confirmation
- Do not commit .env or credentials files
- Do not install packages without asking
- Do not delete tests that are currently failing — fix them instead
- Do not use deprecated APIs or patterns`;

  return [{
    ideTarget: 'windsurf',
    filename: 'project-context.md',
    filePath: '.windsurf/rules/project-context.md',
    content,
  }];
}

// ── Gemini ──────────────────────────────────────

function formatGemini(vars: TemplateVariables, _base: string): GeneratedFile[] {
  const kb = getKnowledgeBlocks(vars);

  const template = `# Agent Instructions — {{projectName}}

## Persona
You are a senior {{languageLabel}} developer specializing in {{framework}} applications.
Write clean, production-ready code following established project patterns.

## Project Overview
- **Project**: {{projectName}}
- **Framework**: {{framework}}
- **Language**: {{languageLabel}}
{{#if styling}}
- **Styling**: {{styling}}
{{/if}}
{{#if database}}
- **Database**: {{database}}
{{/if}}
{{#if auth}}
- **Auth**: {{auth}}
{{/if}}
{{#if deployment}}
- **Deployment**: {{deployment}}
{{/if}}

## Commands
- Dev: \`{{devCommand}}\`
- Build: \`{{buildCommand}}\`
{{#if testing}}
- Test: \`{{testCommand}}\`
{{/if}}
{{#if dbPushCommand}}
- DB: \`{{dbPushCommand}}\`
{{/if}}`;

  let content = compose(template, vars);

  if (kb) {
    content += `\n\n## Project Structure\n\n${kb.fileStructure}`;

    content += `\n\n## Anti-Patterns — AVOID\n\n`;
    content += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    content += `\n\n## Conventions\n\n`;
    content += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    content += `\n\n## Code Patterns\n\n${kb.codePatterns}`;

    if (kb.stackRules) {
      content += `\n\n${kb.stackRules}`;
    }
  }

  content = injectPackageKnowledge(content, vars);

  content += `\n\n## Boundaries
- Never modify migration files without asking
- Never commit .env files
- Ask before adding new dependencies
- Always check existing code patterns first`;

  return [{
    ideTarget: 'gemini',
    filename: 'GEMINI.md',
    filePath: 'GEMINI.md',
    content,
  }];
}

// ── GitHub Copilot ──────────────────────────────

function formatCopilot(vars: TemplateVariables, _base: string): GeneratedFile[] {
  const kb = getKnowledgeBlocks(vars);

  const template = `# Copilot Instructions — {{projectName}}

This is a {{framework}} application using {{languageLabel}}.

## Tech Stack
- {{framework}} ({{languageLabel}})
{{#if styling}}
- {{styling}} for styling
{{/if}}
{{#if database}}
- {{database}} for data persistence
{{/if}}
{{#if auth}}
- {{auth}} for authentication
{{/if}}
{{#if stateManagement}}
- {{stateManagement}} for state management
{{/if}}

## Commands
- Dev: \`{{devCommand}}\`
- Build: \`{{buildCommand}}\`
{{#if testing}}
- Test: \`{{testCommand}}\`
{{/if}}`;

  let content = compose(template, vars);

  if (kb) {
    content += `\n\n## Project Structure\n\n${kb.fileStructure}`;

    content += `\n\n## Anti-Patterns\n\n`;
    content += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    content += `\n\n## Conventions\n\n`;
    content += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    content += `\n\n## Code Patterns\n\n${kb.codePatterns}`;

    if (kb.stackRules) {
      content += `\n\n${kb.stackRules}`;
    }
  }

  content = injectPackageKnowledge(content, vars);

  content += `\n\n## Do Not
- Modify migration files without confirmation
- Commit .env or credential files
- Add dependencies without asking
- Delete failing tests — fix them instead`;

  return [{
    ideTarget: 'copilot',
    filename: 'copilot-instructions.md',
    filePath: '.github/copilot-instructions.md',
    content,
  }];
}

// ── Universal (AGENTS.md) ───────────────────────

function formatUniversal(vars: TemplateVariables, _base: string): GeneratedFile[] {
  const kb = getKnowledgeBlocks(vars);

  const template = `# {{projectName}}

> Tool-agnostic agent instructions for this project.

## Overview
{{framework}} application built with {{languageLabel}}.

## Tech Stack
| Component | Technology |
|-----------|-----------|
| Framework | {{framework}} |
| Language | {{languageLabel}} |
{{#if styling}}
| Styling | {{styling}} |
{{/if}}
{{#if database}}
| Database | {{database}} |
{{/if}}
{{#if auth}}
| Auth | {{auth}} |
{{/if}}
{{#if stateManagement}}
| State | {{stateManagement}} |
{{/if}}
{{#if testing}}
| Testing | {{testing}} |
{{/if}}
{{#if deployment}}
| Deploy | {{deployment}} |
{{/if}}

## Commands
| Action | Command |
|--------|---------|
| Dev Server | \`{{devCommand}}\` |
| Build | \`{{buildCommand}}\` |
{{#if testing}}
| Test | \`{{testCommand}}\` |
{{/if}}
{{#if dbPushCommand}}
| DB Push | \`{{dbPushCommand}}\` |
{{/if}}
| Install | \`{{installCommand}}\` |`;

  let content = compose(template, vars);

  if (kb) {
    content += `\n\n## Project Structure\n\n${kb.fileStructure}`;

    content += `\n\n## Anti-Patterns — DO NOT\n\n`;
    content += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    content += `\n\n## Conventions\n\n`;
    content += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    content += `\n\n## Code Patterns\n\n${kb.codePatterns}`;

    if (kb.stackRules) {
      content += `\n\n${kb.stackRules}`;
    }
  }

  content = injectPackageKnowledge(content, vars);

  content += `\n\n## Guardrails
- ❌ Never modify migration files without asking
- ❌ Never commit .env or secret files
- ❌ Never add dependencies without confirmation
- ❌ Never delete tests — fix them
- ✅ Always check existing patterns before creating new ones
- ✅ Always run linter before committing`;

  return [{
    ideTarget: 'universal',
    filename: 'AGENTS.md',
    filePath: 'AGENTS.md',
    content,
  }];
}
