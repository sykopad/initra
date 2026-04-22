---
name: blueprint-builder
description: Guide for creating high-fidelity Venture Blueprints. Use when adding new templates or project types to the Initra catalog.
---

# Blueprint Builder Skill

This skill ensures that all new project templates ("Blueprints") are high-quality, feature-rich, and follow the Initra standards.

## Blueprint Components

1. **Meta Information**: Slug, name, description, category, and icon.
2. **Stack Options**: Dynamic fields (select, multi-select, toggle) that allow users to customize the blueprint.
3. **Boilerplate Files**: Pre-configured files that are injected into the generated project.
4. **Agent Instructions**: Specific directives for the downstream IDE agent (Cursor, Claude Code, etc.) to follow when building the project.

## How to build a Blueprint

1. **Define the Goal**: What kind of application is this? (e.g., "SaaS Starter", "AI Content Bot").
2. **Registry Entry**: Add the template definition to `src/lib/engine/templates.ts`. Refer to `examples/saas-blueprint.ts` for a high-fidelity reference implementation.
3. **Stack Options**: Use the `stackOptions` array to define user-customizable fields.
4. **Boilerplate**: Define `boilerplateFiles` for critical files like `README.md`, `.env.example`, or core layout files.
5. **Agent Context**: Craft the `agentInstructions` to give the AI agent a clear starting point and specific coding standards.

## Best Practices

- **Avoid Generic Descriptions**: Be specific about what the blueprint builds (e.g., "Next.js 15 with Prisma and Clerk Auth" instead of "Web App").
- **Version Awareness**: Ensure the blueprint specifies which framework versions it supports.
- **Service Synergy**: Recommend services that work well with the blueprint (e.g., recommending Stripe for a SaaS blueprint).
- **WOW Factor**: The default boilerplate should include a premium landing page structure or a functional dashboard.
