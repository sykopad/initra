// =============================================
// Initra — IDE Formatter
// Transforms composed content into IDE-specific formats
// Now with rich framework-specific knowledge injection
// =============================================

import { IDETarget, GeneratedFile, TemplateVariables } from './types';
import { compose } from './prompt-composer';
import { getVersionKnowledge } from './framework-knowledge';
import { getPackageDefinition } from './package-library';
import { getServiceDefinition } from './service-library';
import { getOverlay } from './templates';

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
    case 'trae':
    case 'aider':
    case 'devin':
    case 'replit':
    case 'universal':
      return formatUniversal(variables, baseContent);
    default:
      return formatUniversal(variables, baseContent);
  }
}

// ── Knowledge Injection Helpers ─────────────────

function getKnowledgeBlocks(vars: TemplateVariables) {
  const templateSlug = String(vars.templateSlug || '');
  const versionId = String(vars.templateVersion || '');
  
  const knowledge = getVersionKnowledge(templateSlug, versionId);
  if (!knowledge) return null;

  return {
    antiPatterns: knowledge.antiPatterns,
    conventions: knowledge.conventions,
    documentationUrls: knowledge.documentationUrls,
    recommendedPatterns: knowledge.recommendedPatterns,
  };
}

/**
 * Injects a list of documentation links for frameworks, packages, and services.
 */
function injectDocs(content: string, vars: TemplateVariables): string {
  const links: { name: string; url: string }[] = [];
  
  // Framework Docs
  const fwKnowledge = getVersionKnowledge(String(vars.templateSlug), String(vars.templateVersion));
  if (fwKnowledge) {
    fwKnowledge.documentationUrls.forEach(url => {
      links.push({ name: `${vars.framework} ${vars.templateVersion} Docs`, url });
    });
  }

  // Package Docs
  const pkgSlugs = vars.selectedPackages as string[] ?? [];
  pkgSlugs.forEach(slug => {
    const pkg = getPackageDefinition(slug);
    if (pkg?.documentationUrls) {
      pkg.documentationUrls.forEach(url => {
        links.push({ name: `${pkg.name} Docs`, url });
      });
    }
  });

  // Service Docs
  const svcSlugs = vars.selectedServices as string[] ?? [];
  svcSlugs.forEach(slug => {
    const svc = getServiceDefinition(slug);
    if (svc?.documentationUrl) {
      links.push({ name: `${svc.name} API Reference`, url: svc.documentationUrl });
    }
  });

  if (links.length === 0) return content;

  let docsSection = `\n\n## Reference Documentation\n\n`;
  docsSection += `Always refer to these links for the most current information and best practices:\n\n`;
  links.forEach(link => {
    docsSection += `- [${link.name}](${link.url})\n`;
  });

  return content + docsSection;
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
    const badge = pkg.npmPackage ?? pkg.pyPackage ?? pkg.pubPackage ?? pkg.goPackage;
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

/**
 * Injects information about required APIs and Services
 */
function injectServiceKnowledge(content: string, vars: TemplateVariables): string {
  const selectedServices = vars.selectedServices as string[];
  if (!selectedServices || selectedServices.length === 0) return content;

  let serviceSections: string[] = [];

  for (const slug of selectedServices) {
    const service = getServiceDefinition(slug);
    if (!service) continue;

    let section = `### ${service.icon} ${service.name}`;
    section += `\n- **Purpose**: ${service.description}`;
    section += `\n- **Registration**: [${service.name} Console](${service.registrationUrl})`;
    section += '\n- **Required Environment Variables**:';
    
    for (const env of service.envVars) {
      section += `\n  - \`${env.key}\`: ${env.description}${env.required ? ' (Required)' : ' (Optional)'}`;
    }
    serviceSections.push(section);
  }

  if (!serviceSections.length) return content;

  let serviceContent = '\n\n## APIs & Services\n\n';
  serviceContent += 'This project requires the following external services and API keys:\n\n';
  serviceContent += serviceSections.join('\n\n---\n\n');
  serviceContent += '\n\n### Setup Instructions\n';
  serviceContent += '1. Register for the services above and obtain your API keys.\n';
  serviceContent += '2. Create a `.env.local` file in the root of your project if it doesn\'t exist.\n';
  serviceContent += '3. Copy the keys from your `.env.example` file and populate them with your actual secrets.\n';
  serviceContent += '4. **NEVER** commit `.env.local` or any file containing actual secrets to version control.\n';

  return content + serviceContent;
}

/**
 * Injects beginner-friendly setup guides if the user is a beginner
 */
function injectExperienceKnowledge(content: string, vars: TemplateVariables): string {
  if (!vars.isBeginner) return content;

  let beginnerContent = '\n\n## 🚀 Project Compass (Beginner Guide)\n\n';
  beginnerContent += 'Since you are starting out, here is your path to going live:\n\n';
  
  const slug = vars.templateSlug as string;
  if (slug?.includes('next') || slug?.includes('nuxt')) {
    beginnerContent += '### 1. Deploy Live\n';
    beginnerContent += 'Use [Vercel](https://vercel.com/new). Connect your repo and it will auto-deploy. No complex server setup needed.\n\n';
  }

  if (vars.database === 'supabase' || vars.selectedServices?.includes('supabase')) {
    beginnerContent += '### 2. Database Setup\n';
    beginnerContent += 'Log into [Supabase](https://supabase.com). Create a project, and copy the "Anon Key" and "URL" into your `.env.local` file.\n\n';
  }

  beginnerContent += '### 💡 Pro Tip\n';
  beginnerContent += 'Ask your IDE agent "How do I add a new page?" or "Explain the folder structure" to learn as you build.\n\n';

  return content + beginnerContent;
}

function injectTemplateInstructions(content: string, vars: TemplateVariables): string {
  if (vars.agentInstructions) {
    return content + `\n\n${vars.agentInstructions}`;
  }
  return content;
}

/**
 * Injects Phase 18 Agent Intelligence (Brains, ADRs, Landmarks)
 */
function injectIntelligence(content: string, vars: TemplateVariables): string {
  let result = content;

  // 1. Inject Brain Modules & ADRs
  if (vars.agentIntelligence) {
    result += `\n\n# 🧠 Agent Intelligence Overlays\n\n${vars.agentIntelligence}`;
  }

  // 2. Inject Spatial Awareness (Landmarks)
  const segments = vars.segments as any[];
  if (segments && segments.length > 0) {
    let landmarkSection = `\n\n## 📍 Project Landmarks (Spatial Awareness)\n`;
    landmarkSection += `The following key segments have been identified. Refer to these paths for structural changes:\n\n`;
    
    segments.forEach(seg => {
      landmarkSection += `- **${seg.name}** (${seg.type}): \`${seg.filePath}\` — ${seg.description}\n`;
    });
    
    result += landmarkSection;
  }

  return result;
}

/**
 * Injects selected workflow overlays
 */
function injectOverlays(content: string, vars: TemplateVariables): string {
  const overlaySlugs = vars.selectedOverlays as string[] ?? [];
  if (!overlaySlugs.length) return content;

  let overlayContent = '';
  for (const slug of overlaySlugs) {
    const overlay = getOverlay(slug);
    if (overlay) {
      overlayContent += `\n\n${overlay.content}`;
    }
  }

  return content + overlayContent;
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

  // Inject project-specific context if available
  if (vars.projectContextInstructions) {
    content = vars.projectContextInstructions + "\n\n---\n\n" + content;
  }

  // Inject framework-specific knowledge
  if (kb) {
    content += `\n\n## Anti-Patterns — DO NOT\n\n`;
    content += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    content += `\n\n## Conventions\n\n`;
    content += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    if (kb.recommendedPatterns.length > 0) {
      content += `\n\n## Recommended Patterns\n\n`;
      content += kb.recommendedPatterns.map(p => `### ${p.title}\n${p.description}${p.code ? `\n\`\`\`${vars.language}\n${p.code}\n\`\`\`` : ''}`).join('\n\n');
    }
  }

  // Inject selected package knowledge
  content = injectPackageKnowledge(content, vars);
  content = injectServiceKnowledge(content, vars);
  content = injectDocs(content, vars);
  content = injectExperienceKnowledge(content, vars);
  content = injectTemplateInstructions(content, vars);
  content = injectOverlays(content, vars);
  content = injectIntelligence(content, vars);

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
  const isMultiAgent = vars.orchestrationMode === 'multi-agent';

  if (isMultiAgent) {
    let architectContent = compose(`---
description: High-level architectural decisions and system design for {{projectName}}
alwaysApply: true
---
# 🏗️ Architect Agent

You are the Lead Architect for {{projectName}}.
Your goal is to ensure system integrity, maintainable patterns, and clear boundaries between components.

## High-Level Tech Stack
- Framework: {{framework}} ({{templateVersion}})
- Language: {{languageLabel}}
- Database: {{database}}
- Auth: {{auth}}

## Core Responsibilities
1. **Design Integrity**: Enforce the use of {{framework}}'s best practices.
2. **Data Modeling**: Oversee schema changes in {{database}}.
3. **Review**: Ensure frontend and backend agents follow established patterns.

## Guardrails
- Never commit secrets.
- Never modify migrations without confirmation.`, vars);

    architectContent = injectOverlays(architectContent, vars);

    return [
      {
        ideTarget: 'cursor',
        filename: 'architect.mdc',
        filePath: '.cursor/rules/architect.mdc',
        content: architectContent,
      },
      {
        ideTarget: 'cursor',
        filename: 'frontend.mdc',
        filePath: '.cursor/rules/frontend.mdc',
        content: compose(`---
description: Frontend specialized rules (UI, Styling, State)
alwaysApply: true
---
# 🎨 Frontend Agent

You are the Senior Frontend Developer for {{projectName}}.
Your goal is to build a high-performance, accessible, and beautiful UI.

## Technical Scope
- Styling: {{styling}}
- State Management: {{stateManagement}}
- Components: Pre-existing Design System in globals.css

## Guidelines
1. **Component Composition**: Use functional components and hooks.
2. **Styling**: Favor the project's CSS design system.
3. **Accessibility**: Ensure WCAG compliance.`, vars),
      },
      {
        ideTarget: 'cursor',
        filename: 'backend.mdc',
        filePath: '.cursor/rules/backend.mdc',
        content: compose(`---
description: Backend specialized rules (API, DB, Auth)
alwaysApply: true
---
# ⚙️ Backend Agent

You are the Senior Backend Developer for {{projectName}}.
Your goal is to build secure, scalable, and efficient APIs and data layers.

## Technical Scope
- Runtime: {{languageLabel}}
- Database: {{database}}
- Auth: {{auth}}

## Guidelines
1. **Security**: Implement robust validation and RBAC.
2. **Performance**: Optimize queries for {{database}}.
3. **API Design**: Follow REST/GraphQL standards as selected.`, vars),
      },
    ];
  }

  // Legacy/Single-Agent Mode
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

  // Inject project-specific context if available
  if (vars.projectContextInstructions) {
    contextContent = vars.projectContextInstructions + "\n\n---\n\n" + contextContent;
  }

  if (kb) {
    contextContent += `\n\n## Anti-Patterns — NEVER Do This\n\n`;
    contextContent += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    contextContent += `\n\n## Conventions\n\n`;
    contextContent += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    if (kb.recommendedPatterns.length > 0) {
      contextContent += `\n\n## Preferred Patterns\n\n`;
      contextContent += kb.recommendedPatterns.map(p => `### ${p.title}\n${p.description}${p.code ? `\n\`\`\`${vars.language}\n${p.code}\n\`\`\`` : ''}`).join('\n\n');
    }
  }

  // Inject selected package knowledge into the context file
  contextContent = injectPackageKnowledge(contextContent, vars);
  contextContent = injectServiceKnowledge(contextContent, vars);
  contextContent = injectExperienceKnowledge(contextContent, vars);
  contextContent = injectTemplateInstructions(contextContent, vars);
  contextContent = injectOverlays(contextContent, vars);
  contextContent = injectIntelligence(contextContent, vars);

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
  const isMultiAgent = vars.orchestrationMode === 'multi-agent';

  if (isMultiAgent) {
    return [
      {
        ideTarget: 'windsurf',
        filename: 'architect.md',
        filePath: '.windsurf/rules/architect.md',
        content: injectOverlays(
          injectTemplateInstructions(
            injectExperienceKnowledge(
              compose(`# 🏗️ Architect Agent — {{projectName}}

System integrity and architectural standards for {{framework}}.

## Tech Stack
- Framework: {{framework}}
- Language: {{languageLabel}}
- Database: {{database}}

## Rules
1. Enforce strict type safety.
2. Maintain clean separation between business logic and UI.`, vars),
              vars
            ),
            vars
          ),
          vars
        ),
      },
      {
        ideTarget: 'windsurf',
        filename: 'frontend.md',
        filePath: '.windsurf/rules/frontend.md',
        content: compose(`# 🎨 Frontend Agent — {{projectName}}

UI, UX, and State management rules.

## Technical Scope
- Styling: {{styling}}
- State: {{stateManagement}}

## Rules
1. Use semantic HTML and responsive design.
2. Follow the project's CSS design system.`, vars),
      },
      {
        ideTarget: 'windsurf',
        filename: 'backend.md',
        filePath: '.windsurf/rules/backend.md',
        content: compose(`# ⚙️ Backend Agent — {{projectName}}

API, DB, and Security rules.

## Rules
1. Implement error handling for all external calls.
2. Optimize {{database}} queries.`, vars),
      },
    ];
  }

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
    content += `\n\n## Anti-Patterns — DO NOT\n\n`;
    content += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    content += `\n\n## Conventions\n\n`;
    content += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    if (kb.recommendedPatterns.length > 0) {
      content += `\n\n## Recommended Patterns\n\n`;
      content += kb.recommendedPatterns.map(p => `### ${p.title}\n${p.description}${p.code ? `\n\`\`\`${vars.language}\n${p.code}\n\`\`\`` : ''}`).join('\n\n');
    }
  }

  content = injectPackageKnowledge(content, vars);
  content = injectServiceKnowledge(content, vars);
  content = injectOverlays(content, vars);
  content = injectIntelligence(content, vars);

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
    content += `\n\n## Anti-Patterns — AVOID\n\n`;
    content += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    content += `\n\n## Conventions\n\n`;
    content += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    if (kb.recommendedPatterns.length > 0) {
      content += `\n\n## Recommended Patterns\n\n`;
      content += kb.recommendedPatterns.map(p => `### ${p.title}\n${p.description}${p.code ? `\n\`\`\`${vars.language}\n${p.code}\n\`\`\`` : ''}`).join('\n\n');
    }
  }

  content = injectPackageKnowledge(content, vars);
  content = injectServiceKnowledge(content, vars);
  content = injectOverlays(content, vars);
  content = injectIntelligence(content, vars);

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
    content += `\n\n## Anti-Patterns\n\n`;
    content += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    content += `\n\n## Conventions\n\n`;
    content += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    if (kb.recommendedPatterns.length > 0) {
      content += `\n\n## Recommended Patterns\n\n`;
      content += kb.recommendedPatterns.map(p => `### ${p.title}\n${p.description}${p.code ? `\n\`\`\`${vars.language}\n${p.code}\n\`\`\`` : ''}`).join('\n\n');
    }
  }

  content = injectPackageKnowledge(content, vars);
  content = injectServiceKnowledge(content, vars);
  content = injectOverlays(content, vars);
  content = injectIntelligence(content, vars);

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
    content += `\n\n## Anti-Patterns — DO NOT\n\n`;
    content += kb.antiPatterns.map(ap => `- ${ap}`).join('\n');

    content += `\n\n## Conventions\n\n`;
    content += kb.conventions.map((c, i) => `${i + 1}. ${c}`).join('\n');

    if (kb.recommendedPatterns.length > 0) {
      content += `\n\n## Recommended Patterns\n\n`;
      content += kb.recommendedPatterns.map(p => `### ${p.title}\n${p.description}${p.code ? `\n\`\`\`${vars.language}\n${p.code}\n\`\`\`` : ''}`).join('\n\n');
    }
  }

  content = injectPackageKnowledge(content, vars);
  content = injectServiceKnowledge(content, vars);
  content = injectOverlays(content, vars);
  content = injectIntelligence(content, vars);

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
