// =============================================
// Initra — IDE Formatter
// Transforms composed content into IDE-specific formats
// =============================================

import { IDETarget, GeneratedFile, TemplateVariables } from './types';
import { compose } from './prompt-composer';

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

// ── Claude Code ─────────────────────────────────

function formatClaudeCode(vars: TemplateVariables, _base: string): GeneratedFile[] {
  const template = `# Project: {{projectName}}

{{framework}} application with {{languageLabel}}.

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

## Architecture
{{#if framework}}
{{framework}} project structure. Follow framework conventions.
{{/if}}
{{#if styling}}
Styling: {{styling}}. Follow the established styling patterns.
{{/if}}
{{#if database}}
Database: {{database}}. Always use migrations for schema changes.
{{/if}}
{{#if auth}}
Auth: {{auth}}. Never expose auth secrets client-side.
{{/if}}

## Rules
{{#if language}}
- Use {{languageLabel}} with strict typing. No \`any\` types.
{{/if}}
- Use named exports, never default exports.
- Keep functions small and focused.
- Use early returns to reduce nesting.
- Always validate input data before processing.
{{#if database}}
- Never expose service role keys or admin secrets client-side.
- Always use parameterized queries — never interpolate user input into SQL.
{{/if}}
{{#if stateManagement}}
- State Management: {{stateManagement}}. Keep stores minimal and focused.
{{/if}}

## Boundaries
- Never delete or modify migration files without asking.
- Never commit .env or secret files.
- Never install new dependencies without asking first.
- Always check existing patterns before creating new utilities.
- Always run the linter before committing.`;

  const content = compose(template, vars);
  return [{
    ideTarget: 'claude-code',
    filename: 'CLAUDE.md',
    filePath: 'CLAUDE.md',
    content,
  }];
}

// ── Cursor ──────────────────────────────────────

function formatCursor(vars: TemplateVariables, _base: string): GeneratedFile[] {
  const contextTemplate = `---
description: Project architecture and conventions for {{projectName}}
alwaysApply: true
---
# Project Context — {{projectName}}

This is a {{framework}} application using {{languageLabel}}.
{{#if styling}}
Styling: {{styling}}
{{/if}}
{{#if database}}
Database: {{database}}
{{/if}}
{{#if auth}}
Auth: {{auth}}
{{/if}}

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
{{/if}}

## Commands
- Dev: \`{{devCommand}}\`
- Build: \`{{buildCommand}}\`
{{#if testing}}
- Test: \`{{testCommand}}\`
{{/if}}
{{#if dbPushCommand}}
- DB Push: \`{{dbPushCommand}}\`
{{/if}}

## Conventions
{{#if language}}
- Use {{languageLabel}} strict mode. Avoid \`any\`.
{{/if}}
- Prefer named exports over default exports.
- Use early returns to reduce nesting.
- Keep components/functions small and focused.
{{#if database}}
- Use parameterized queries. Never interpolate user input.
- Never expose secrets or service keys client-side.
{{/if}}

## Boundaries
- Never modify migration files without asking.
- Never commit .env files.
- Ask before installing new dependencies.
- Check existing patterns before creating new code.`;

  const contextContent = compose(contextTemplate, vars);

  const codingTemplate = `---
description: Coding standards and style rules
alwaysApply: true
---
# Coding Standards

## Style Rules
{{#if language}}
- Language: {{languageLabel}} with strict typing enabled
- No \`any\` types — always provide explicit type annotations
{{/if}}
- Use \`const\` by default, \`let\` only when reassignment is needed
- Use arrow functions for callbacks and inline functions
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

  const codingContent = compose(codingTemplate, vars);

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
{{/if}}

## Coding Conventions
- Use {{languageLabel}} with strict typing
- Prefer named exports over default exports
- Use early returns to reduce nesting
- Keep functions and components small and focused
- Always validate data at boundaries
{{#if database}}
- Use parameterized queries, never string interpolation for SQL
- Keep database logic in dedicated service/repository modules
{{/if}}

## Do Not
- Do not modify migration files without explicit confirmation
- Do not commit .env or credentials files
- Do not install packages without asking
- Do not delete tests that are currently failing — fix them instead
- Do not use deprecated APIs or patterns`;

  const content = compose(template, vars);
  return [{
    ideTarget: 'windsurf',
    filename: 'project-context.md',
    filePath: '.windsurf/rules/project-context.md',
    content,
  }];
}

// ── Gemini ──────────────────────────────────────

function formatGemini(vars: TemplateVariables, _base: string): GeneratedFile[] {
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
{{/if}}

## Rules
- Always use {{languageLabel}} with strict mode
- No \`any\` types — provide explicit annotations
- Prefer named exports
- Use early returns for guard clauses
- Keep functions focused and under 50 lines
{{#if database}}
- Always use parameterized queries
- Never expose service role keys client-side
{{/if}}

## Boundaries
- Never modify migration files without asking
- Never commit .env files
- Ask before adding new dependencies
- Always check existing code patterns first`;

  const content = compose(template, vars);
  return [{
    ideTarget: 'gemini',
    filename: 'GEMINI.md',
    filePath: 'GEMINI.md',
    content,
  }];
}

// ── GitHub Copilot ──────────────────────────────

function formatCopilot(vars: TemplateVariables, _base: string): GeneratedFile[] {
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

## Coding Standards
- Use {{languageLabel}} strict mode with explicit types
- Named exports only, no default exports
- Early returns for guard clauses
- Small, focused functions (max 50 lines)
- Validate input data at boundaries
{{#if database}}
- Use parameterized queries, never string interpolation
{{/if}}

## File Organization
- Follow existing project structure conventions
- Group related functionality in feature directories
- Keep one component/module per file

## Do Not
- Modify migration files without confirmation
- Commit .env or credential files
- Add dependencies without asking
- Delete failing tests — fix them instead`;

  const content = compose(template, vars);
  return [{
    ideTarget: 'copilot',
    filename: 'copilot-instructions.md',
    filePath: '.github/copilot-instructions.md',
    content,
  }];
}

// ── Universal (AGENTS.md) ───────────────────────

function formatUniversal(vars: TemplateVariables, _base: string): GeneratedFile[] {
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
| Install | \`{{installCommand}}\` |

## Conventions
1. Use {{languageLabel}} with strict typing — no \`any\`
2. Named exports only, never default exports
3. Early returns for guard clauses
4. Small, focused functions (max 50 lines)
5. Validate all input data at boundaries
{{#if database}}
6. Parameterized queries only — never interpolate user input
7. Keep DB logic in dedicated service modules
{{/if}}

## Guardrails
- ❌ Never modify migration files without asking
- ❌ Never commit .env or secret files
- ❌ Never add dependencies without confirmation
- ❌ Never delete tests — fix them
- ✅ Always check existing patterns before creating new ones
- ✅ Always run linter before committing`;

  const content = compose(template, vars);
  return [{
    ideTarget: 'universal',
    filename: 'AGENTS.md',
    filePath: 'AGENTS.md',
    content,
  }];
}
