# Initra — Initiate Infrastructure

> AI-powered project bootstrapping platform that generates tailored IDE agent configuration files.

<!-- BEGIN:nextjs-agent-rules -->
## Next.js 16 (Turbopack)

This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

**Initra** (Initiate Infrastructure) is a high-performance **Autonomous SaaS Builder** that empowers developers to create and manage applications on their own Git infrastructure. 

Positioned as a developer-first alternative to platforms like **Lovable** and **Base44**, Initra eliminates vendor lock-in by:
1. **Deep Repository Analysis**: Scans existing GitHub repos to identify UI segments (Headers, Pages, Layouts).
2. **SaaS Builder Mode**: Interactive interface to customize individual components via targeted AI prompts.
3. **Credit-Based Economy**: Tiered model registry (Claude Opus 4.7, GPT-5 Codex) with performance-optimized pricing.
4. **Git Infrastructure Ownership**: All changes are pushed directly to the user's own repository, ensuring 100% code ownership.
5. **Multi-Agent Orchestration**: Synthesis of high-fidelity objectives into specialized IDE rules and agent workflows.
6. **Community Ecosystem**: Suggestions, voting, and agent contributions for open-source venture blueprints.

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
| `layman-projects.ts` | Goals-to-stack registry for non-technical users (Project Types) |
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

6. **GitHub push integration (Complete)** — Authorize GitHub and push generated files directly to a repo in one click. (Done 2026-04-20)

7. **More templates (Complete)** — Expanded library to 9+ frameworks. Added Django 6, Nuxt 3, and Go (Gin) with full boilerplate support. (Done 2026-04-20)

8. **Template versioning (Complete)** — Handled version-specific breaking changes (e.g. Next.js 16) via engine-level branching. (Done 2026-04-20)

9. **AI Goal Assistant (Complete)** — Context-aware project mapping, tiered model selection, and PayPal donation integration with webhook automation. (Done 2026-04-20)

### 🟢 Phase 3: Ecosystem & Scale

10. **Syntax-highlighted preview (Complete)** — Replaced raw text blocks with a high-performance Shiki-powered viewer for all generated files. (Done 2026-04-20)

11. **Unit tests for the engine (Complete)** — Integrated Vitest with coverage for prompt interpolation, version logic, and whitespace cleanup. (Done 2026-04-20)

12. **"Import from repo" feature (Complete)** — Implemented server-side heuristic scanner to auto-detect framework and dependencies from GitHub URLs. (Done 2026-04-20)

13. **Mobile responsiveness (Complete)** — Added sticky navigation, responsive grids, and fluid typography across the wizard and community pages. (Done 2026-04-20)

14. **SEO + Open Graph (Complete)** — Dynamic 1200x630 OG images and per-page metadata implemented for shared configurations via Edge runtime. (Done 2026-04-20)

### 🔵 Phase 5: Advanced Agentic Features (Complete)

15. **Multi-Agent Orchestration (Complete)** — Transition from single-file rules to directory-based agent hierarchies (`.cursor/rules/*.mdc`).
16. **Workflow Tailoring (Complete)** — Dynamic rule branching for "Beginner" (Educational/Safe) vs "Expert" (Architectural/Concise) levels.
17. **Workflow Overlays (Complete)** — Selectable logic blocks for complex tasks like "Security Audit" or "Performance Optimization".
18. **MCP Server Integration (Complete)** — Boilerplate and instructions for building MCP servers to extend IDE agent capabilities.

### 🟣 Phase 6: Deployment & Intelligence Expansion (Complete)

19. **Deployment Orchestration (Complete)** — Integrated GitHub push, Vercel hooks, and Supabase database branching.
20. **IDE Library Expansion (Complete)** — Added native support for Trae AI, Aider, Devin, and Replit Agent.
21. **Expert Brain Overlays (Complete)** — Implemented specialized behavioral modules (V0 Designer, Deep Reasoning, Security Sentinel) derived from top-tier system prompts.

### 🌐 Phase 7: The Autonomous Venture Studio (Complete)

22. **AI Idea Fabric (Complete)** — High-fidelity autonomous brainstorming driven by **Claude Opus 4.6** (via OpenRouter). Generates one innovative venture blueprint every 24 hours.
23. **The "Hatch" Engine (Complete)** — End-to-end orchestration of GitHub Repo creation, Vercel project provisioning, and custom domain assignment. Support for `VERCEL_TEAM_ID` and `GITHUB_TOKEN` integrated.
24. **Venture Marketplace (Complete)** — UI upgraded to support autonomous project discovery, community voting, and real-time hatching status.
25. **Donation Integration (Complete)** — Homepage updated with a support rationale for scaling the Venture Studio infrastructure beyond Vercel Hobby limits.
26. **Autonomous Worker Injection (Complete)** — Automated delivery of GitHub Action workflows that spin up coding agents (Aider) upon project birth. (Done 2026-04-20)

30. **Guided Service Reasoning**: Business-friendly explanations for suggested infrastructure (e.g., "Why Supabase?"). (Done 2026-04-21)

### 🚀 Phase 9: The Autonomous SaaS Pivot (Complete)

31. **Deep Repository Segmentation**: Heuristic analyzer for framework-specific landmarks (Header, Navbar, Layout, Pages).
32. **Targeted AI Editing**: Multi-file prompt engineering for high-fidelity code patching (JSON-based).
33. **Live Preview Orchestration**: Side-by-side editing workspace with branch-based Vercel deployments.
34. **Profit-Driven Model Hub**: Integrated registry for 7+ premium models with credit-based monetization.

### ⚡ Phase 10: Hatching 2.0 — The Fully Orchestrated Venture (Complete)

35. **AI SQL Architect**: Dynamic schema generation based on project blueprints. (Done 2026-04-21)
36. **Automatic Migration Injection**: Direct PG orchestration to provision fresh databases with tables, RLS, and functions. (Done 2026-04-21)
37. **Edge Function Autopilot**: Automated deployment of Supabase Edge Functions during birth. (Done 2026-04-21)
38. **Fine-Grained Feedback**: Real-time provisioning logs for the "Hatch" lifecycle. (Done 2026-04-21)

### 🧩 Phase 11: Deep Heuristic Optimization (Complete)

39. **Next.js 16 Landmark Detection**: Granular extraction of Hero, Footer, Sidebar, and Metadata segments. (Done 2026-04-21)
40. **Feature-Based Grouping**: Auto-clustering of segments by domain (e.g., Auth, Dashboard, Billing). (Done 2026-04-21)
41. **Logic Segmentation**: Identify Edge Functions, API Routes, and Middleware as editable logic blocks. (Done 2026-04-21)
42. **Config Heuristics**: Targeted editing of Tailwind configs and framework settings. (Done 2026-04-21)

### 🟢 Phase 12: Nuxt 4 (Vue.js) (Active)

43. **Nuxt 4 Heuristic Archetypes**: Detection of `layouts/`, `pages/`, and `composables/`.
44. **Nitro Segmentation**: Identify Nitro API routes and server middleware.
45. **Nuxt-specific Landmarks**: Recognize `NuxtLayout` and `NuxtPage` entry points.

## Framework Roadmap

We implement frameworks **one at a time** to ensure maximum accuracy and deep heuristic analysis.

| Framework | Status | Methodology |
|-----------|--------|-------------|
| **Next.js 16 (App Router)** | ✅ Deep | Full layout/page/component segmentation & targeted editing. |
| **Nuxt 4 (Vue.js)** | ✅ Deep | Composition API heuristics and directory-based segmentation. |
### 🟢 Phase 13: Django 6 (Python) (Complete)

46. **Django 6 Heuristic Archetypes**: Detection of `models.py`, `views.py`, and `templates/`. (Done 2026-04-21)
47. **MVT Segmentation**: Logic/UI separation for Python and HTML blocks. (Done 2026-04-21)
48. **Landmark Detection**: Recognition of `base.html` and Django-specific layout files. (Done 2026-04-21)

### 🔵 Phase 14: Go (Gin/Axum) (Complete)

49. **Go Route Recognition**: Identification of Gin/Axum route handlers and middleware. (Done 2026-04-21)
50. **Domain Clustering**: Mapping Go packages to feature domains. (Done 2026-04-21)
51. **Template Parsing**: Heuristic detection of Go templates (`.gohtml`, `.tmpl`). (Done 2026-04-21)

### 📱 Phase 15: Flutter 4 (Complete)

52. **Flutter Widget Tree Analysis**: Heuristic detection of Screen vs Component vs Model in Dart. (Done 2026-04-21)
53. **State Management Heuristics**: Detect Bloc, Provider, or Riverpod patterns. (Done 2026-04-21)
54. **Mobile Navigation Mapping**: Identification of Router and NavRail landmarks. (Done 2026-04-21)

### 📊 Phase 16: Autonomous Quality Audits (Active)

55. **Heuristic Scorecard**: Implementation of SEO, Security, and Performance audit rules.
56. **UI Integration**: Dynamic "Health Gauge" and check-list in the repo builder.
57. **Framework-Specific Audits**: Specialized rules for Next.js Metadata and Django settings.

### ⚡ Phase 17: Hatching 3.0 (Complete)

58. **Automated Testing Injection**: Programmatic addition of Vitest/Playwright suites to new projects. (Done 2026-04-21)
59. **Pro Infrastructure**: Support for Vercel Teams and advanced deployment orchestration. (Done 2026-04-21)
60. **GitHub Secrets Orchestration**: Automated injection of Supabase keys into GitHub Repository Secrets. (Done 2026-04-21)

### 🟣 Phase 18: Expert Brain Overlays (Complete)

61. **Behavioral Module Registry**: Specialized instructions for Designer, Reasoning, and Security profiles. (Done 2026-04-21)
62. **Framework-Specific ADRs**: Automated injection of architectural decision records for Next.js 16/Nuxt 4. (Done 2026-04-21)
63. **Spatial Awareness Injection**: Mapping heuristic "Landmarks" directly into agent instructions. (Done 2026-04-21)

### ⚡ Phase 19: Deployment Orchestration Expansion (Complete)

64. **GitHub Environment Provisioning**: Automated creation of "Production" and "Preview" environments with scoped secrets. (Done 2026-04-21)
65. **Branch Protection Orchestration**: Programmatic enforcement of CI passing rules for birthed repositories. (Done 2026-04-21)
66. **Granular Provisioning Feedback**: Real-time lifecycle status updates for the full "Hatch" sequence. (Done 2026-04-21)

### 🧩 Phase 20: IDE Library Expansion (Complete)

67. **Trae AI Support**: Native `.trae/rules/project_rules.md` generation with adaptive instructions. (Done 2026-04-21)
68. **Aider & Devin Support**: Optimized instruction templates for leading AI agents. (Done 2026-04-21)
69. **Replit Agent Orchestration**: Specialized root-level instructions for Replit Workspace birth. (Done 2026-04-21)

### 🟣 Phase 21: Expert Brain Overlays — UI Integration (Active)

70. **Brain Selection Interface**: Dedicated wizard step for visual "Brain Profile" selection.
71. **Intelligence Preview**: Live preview of behavioral directives during selection.
72. **Spatial Awareness Dashboard**: Display identified repo landmarks in the project overview.

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
