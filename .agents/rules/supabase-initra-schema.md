# Supabase Initra Schema Rule

**Activation: Glob (`src/lib/supabase/**/*.ts`)**

Ensures all Supabase interactions within the Initra platform target the custom `initra` schema, not the `public` schema.

## Enforcement

1. **Client Initialization**: When calling `createBrowserClient` or `createServerClient`, the `db.schema` option MUST be set to `'initra'`.

```typescript
// Correct Pattern
const supabase = createBrowserClient(url, key, {
  db: { schema: 'initra' }
});
```

2. **Querying**: Always verify that the schema is correctly scoped. If using raw SQL via `mcp_supabase-aytada_execute_sql`, explicitly reference the `initra.` prefix for tables if needed.

## Schema Rationale

The `initra` schema is used to isolate platform-specific logic (profiles, templates, wizards) from default Supabase or user-generated data.

## Table Registry

Reference the following tables within the `initra` schema:
- `profiles`
- `project_templates`
- `template_stack_options`
- `ide_targets`
- `wizard_sessions`
- `generated_files`
- `community_projects`
- `project_votes`
- `agent_contributions`
- `prompt_templates`
