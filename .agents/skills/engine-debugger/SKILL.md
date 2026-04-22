---
name: engine-debugger
description: Helps with debugging and expanding the Initra deterministic prompt engine. Use when modifying src/lib/engine/ logic, templates, or package/service libraries.
---

# Engine Debugger Skill

This skill provides a structured approach to maintaining and extending the Initra prompt generation engine.

## Core Architecture

The engine is **deterministic**. It does not use LLMs at runtime. It follows this flow:
1. `WizardConfig` (User input)
2. `extractVariables` (Variable mapping)
3. `formatForIDE` (Template resolution)
4. `generateProjectBoilerplate` (File generation)

## When to use this skill

- When adding a new project template to `templates.ts`.
- When updating the `package-library.ts` or `service-library.ts`.
- When adding support for a new IDE in `ide-targets.ts` and `ide-formatter.ts`.
- When debugging why a variable isn't correctly rendered in the final output.

## How to Debug

1. **Check Variable Extraction**: Review `src/lib/engine/prompt-composer.ts` to see how raw `WizardConfig` is mapped to `TemplateVariables`.
2. **Verify Templates**: Check `src/lib/engine/templates.ts`. Templates use `{{variable}}` syntax handled by the deterministic composer.
3. **Run Unit Tests**: Use the provided script to run engine tests.

```bash
# From the skill folder
bash scripts/test-engine.sh
```

## Conventions

- **Slugified IDs**: Always use lowercase, hyphenated slugs for packages, services, and templates.
- **Strict Types**: Ensure any new config fields are added to `WizardConfig` and `TemplateVariables` in `types.ts`.
- **No Side Effects**: Engine functions MUST be pure. Do not perform file I/O or network calls inside the core engine logic.
