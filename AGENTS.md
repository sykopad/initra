# Initra — Initiate Infrastructure

> AI-powered project bootstrapping platform that generates tailored IDE agent configuration files.

<!-- BEGIN:nextjs-agent-rules -->
## Next.js 16 (Turbopack)

This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

**Initra** (Initiate Infrastructure) helps developers bootstrap projects by:
1. Walking through a 8-step wizard (Start → Project → Stack → Packages → Services → IDE → Review → Export).
2. **AI Assistant Mode**: Describe a goal and let AI suggest the perfect architecture mapping.
3. **Tiered Model Engine**: Logic-based model selection (Mini, Codex, Opus) based on user tier.
4. **Experience Tailoring**: Branched guidance (Dev vs Business Owner) for infrastructure setup.
4. Injecting framework-specific knowledge, anti-patterns, and code snippets into agent files.
5. Suggesting open-source community projects and voting on ideas.

## Tech Stack

- **Framework**: Next.js 16.2.4 with App Router (Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Vanilla CSS with custom design system (`globals.css`)
- **Database**: Supabase (PostgreSQL) — custom `initra` schema
- **Auth**: Supabase Auth (planned)
- **Deployment**: Vercel (planned)

## Architecture

### Prompt Generation Engine (`src/lib/engine/`)

A **pure, deterministic TypeScript pipeline** — no LLM calls:

```
[AI Prompt (Step 0)] → Analyze Goal API → WizardConfig → Template Resolver → Package Mapper → Service Selector → Variable Extractor → Prompt Composer → IDE Formatter → GeneratedFile[] (.md + .env.example)
```

| File | Purpose |
|------|---------|
| `types.ts` | All TypeScript interfaces and type definitions |
| `templates.ts` | 6 project templates (Next.js, React Native, FastAPI, Flutter, Express, Python ML) |
| `package-library.ts` | Registry of 50+ common packages with setup/usage knowledge |
| `service-library.ts` | Hub for 15+ external APIs (Stripe, OpenAI, Clerk, etc.) with registration URLs |
| `ide-targets.ts` | 6 IDE target configurations |
| `prompt-composer.ts` | Custom template engine with `{{variable}}`, `{{#if}}`, `{{#unless}}` |
| `ide-formatter.ts` | Transforms composed content into IDE-specific file formats |
| `index.ts` | Main entry: `generateAgentFiles()` and `.env.example` synthesis |

### Supported IDEs

| IDE | Output File |
|-----|-------------|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/*.mdc` (YAML frontmatter) |
| Windsurf | `.windsurf/rules/*.md` |
| Gemini | `GEMINI.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Universal | `AGENTS.md` |

### Database Schema (`initra` schema)

All tables live in the `initra` schema on Supabase (NOT `public`).
When writing queries via Supabase client, set `db.schema` to `'initra'`.

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends auth.users via trigger) |
| `project_templates` | Pre-built project configurations |
| `template_stack_options` | Dynamic form fields per template |
| `ide_targets` | Supported IDE configs |
| `wizard_sessions` | Wizard completion records |
| `generated_files` | Output files from engine |
| `community_projects` | User-suggested open source projects |
| `project_votes` | Upvote/downvote tracking (triggers update `vote_score`) |
| `agent_contributions` | Community agent file uploads |
| `prompt_templates` | Stored generation templates |

### Supabase Client Configuration

When creating Supabase clients, always include the schema option:

```typescript
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(url, key, {
  db: { schema: 'initra' }
});
```

### File Structure

```
├── app/
│   ├── layout.tsx              # Root layout with SEO metadata
│   ├── page.tsx                # Landing page (hero, features, IDE grid)
│   ├── globals.css             # Complete design system (dark theme, glassmorphism)
│   ├── wizard/page.tsx         # 7-step wizard (Project → Stack → Packages → Services → IDE → Review → Export)
│   ├── community/page.tsx      # Community hub (voting, filtering, suggest modal)
│   ├── shared/[slug]/page.tsx  # Shared config permalink viewer
│   └── api/
│       ├── generate/route.ts   # POST — prompt generation endpoint
│       └── community/route.ts  # GET/POST — community CRUD
└── lib/
    ├── engine/                 # Prompt generation engine (8 files)
    │   ├── package-library.ts  # Knowledge registry for packages
    │   └── service-library.ts  # Registry for external APIs & Env vars
    └── supabase/
        ├── client.ts           # Browser client
        └── server.ts           # Server client (with cookies)
```

## Commands

- `npm run dev` — Start development server (Turbopack)
- `npm run build` — Production build
- `npm run lint` — ESLint

## Roadmap

### 🔴 Critical — Makes or breaks the product

1. **Richer generated output (Phase 1 Complete)** — We now inject:
   - Deep package-specific knowledge for 50+ libraries.
   - Comprehensive API/Service integration guides with registration links.
   - Anti-patterns and best practices for common stack components.

2. **Apply migration & wire up persistence (Complete)** — Community hub and wizard sessions are now connected to the Supabase `initra` schema. (Done 2026-04-20)

3. **Auth flow (Complete)** — GitHub OAuth via Supabase Auth implemented. Enables profile creation, session history, and persistent activity. (Done 2026-04-20)

4. **Boilerplate Logic Engine (Complete)** — Full project structure generation, file merging, variable interpolation. Transitioned from prompt generator to bootstrapper. (Done 2026-04-20)

### 🟡 High Impact — Differentiation

5. **Custom rules editor (Complete)** — Users can now edit generated Markdown and reorder sections via a drag-and-drop interface in Step 6. (Done 2026-04-20)

6. **GitHub push integration** — Authorize GitHub and push generated files directly to a repo in one click.

7. **More templates (Complete)** — Expanded library to 9+ frameworks. Added Django 6, Nuxt 3, and Go (Gin) with full boilerplate support. (Done 2026-04-20)

8. **Template versioning** — Next.js 15 vs 16 have different conventions. Templates should be version-aware.

9. **AI Goal Assistant (Complete)** — Context-aware project mapping, tiered model selection, and PayPal donation integration. (Done 2026-04-20)

### 🟢 Polish — Makes it feel complete

9. **Syntax-highlighted preview** — Replace raw text `<div>` with proper code viewer (e.g., `shiki` or `react-syntax-highlighter`).

10. **Unit tests for the engine** — Add `vitest` with snapshot tests for each template × IDE combination.

11. **"Import from repo" feature** — Scan a GitHub repo's `package.json` / `pyproject.toml` to auto-detect stack config and pre-fill the wizard.

12. **Mobile responsiveness** — Responsive breakpoints for wizard and community pages.

12. **SEO + Open Graph** — Dynamic OG images for shared configs, per-page meta tags, sitemap.

## Conventions

- Use TypeScript strict mode. Avoid `any`.
- Use named exports, never default exports (except page components).
- Keep functions small and focused.
- Use early returns to reduce nesting.
- All database tables are in the `initra` schema, NOT `public`.
- Use `extensions.uuid_generate_v4()` for UUIDs in SQL (Supabase puts extensions in the `extensions` schema).
- Never expose secrets or service keys client-side.
- Use parameterized queries. Never interpolate user input into SQL.
- Component styling uses the CSS design system in `globals.css` — no inline Tailwind.

## Boundaries

- Never modify migration files without asking.
- Never commit `.env.local` or `.env` files.
- Ask before installing new dependencies.
- Check existing patterns before creating new abstractions.
- All community data and wizard sessions are stored in Supabase via the `initra` schema.
