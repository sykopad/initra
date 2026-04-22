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

## Claude Code Documentation Index

Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
Use this file to discover all available pages before exploring further.

## Extend Claude with skills

Skills extend what Claude can do. Create a `SKILL.md` file with instructions, and Claude adds it to its toolkit. Claude uses skills when relevant, or you can invoke one directly with `/skill-name`.

Create a skill when you keep pasting the same playbook, checklist, or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact. Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it.

- **Project Skills**: `.claude/skills/<skill-name>/SKILL.md`
- **Personal Skills**: `~/.claude/skills/<skill-name>/SKILL.md`
- **Standard**: Follows the [Agent Skills](https://agentskills.io) open standard.

Skills support YAML frontmatter for configuration (`name`, `description`, `disable-model-invocation`, etc.) and string substitutions (`$ARGUMENTS`, `${CLAUDE_SESSION_ID}`, etc.).

## Cursor — Rules, Skills & Subagents

Cursor provides a comprehensive system for guiding AI through persistent context, specialized skills, and autonomous subagents.

### Rules
Cursor uses rules to provide system-level instructions. They bundle prompts, scripts, and conventions.
- **Project Rules**: Stored in `.cursor/rules/`, version-controlled, and scoped via glob patterns.
- **User Rules**: Global preferences defined in settings.
- **Team Rules**: Managed from the dashboard for enterprise-wide standards.
- **AGENTS.md**: Simple, lightweight alternative for project-level instructions.

#### Rule Activation Modes
- **Always Apply**: Injected into every chat.
- **Apply Intelligently**: Agent decides relevance based on description.
- **Apply to Specific Files**: Triggered by glob patterns.
- **Apply Manually**: Mentioned via `@rule-name`.

### Agent Skills
Cursor supports the **Agent Skills** open standard for portable, actionable capabilities.
- **Locations**: `.cursor/skills/`, `.agents/skills/`, and user-level `~/.cursor/skills/`.
- **Structure**: A folder containing `SKILL.md` (instructions) and optional `scripts/`, `references/`, and `assets/`.
- **Invocation**: Automatic (based on context) or manual (via `/skill-name`).

### Subagents
Subagents are specialized assistants for parallel tasks or complex workflows.
- **Context Isolation**: Each subagent runs in its own window, preventing context bloat in the main chat.
- **Built-in Subagents**: `Explore` (codebase analysis), `Bash` (terminal operations), and `Browser` (web interaction).
- **Custom Subagents**: Defined in `.cursor/agents/` with YAML frontmatter specifying name, description, and model choice (`inherit` or `fast`).

## Windsurf — Cascade, Memories & Rules

Persist context across Cascade conversations with auto-generated memories and user-defined rules.

### Features
- **Rules**: Tell Cascade how to behave (e.g., "use bun, not npm"). Activation: `always_on`, `glob`, `model_decision`, or `manual`.
- **AGENTS.md**: Location-scoped rules with zero config. Root = always-on, subdirectory = glob.
- **Workflows**: Prompt templates for repeatable multi-step tasks. Invoke with `/[workflow-name]`.
- **Skills**: Multi-step procedures bundled with supporting files (scripts, templates). Dynamically invoked or `@mention`.
- **Memories**: Auto-generated context stored locally in `~/.codeium/windsurf/memories/`.

### Activation Modes
| Mode | Trigger | Context Cost |
|------|---------|--------------|
| Always On | `always_on` | Every message |
| Model Decision | `model_decision` | Description always; content on demand |
| Glob | `glob` | Only when matching files are touched |
| Manual | `manual` | Only when `@mentioned` |

### Skill Structure
- **Workspace Skill**: `.windsurf/skills/<skill-name>/SKILL.md`
- **Global Skill**: `~/.codeium/windsurf/skills/<skill-name>/SKILL.md`
- **Specification**: Follows the [Agent Skills](https://agentskills.io) open standard.

### Worktrees
Windsurf supports git worktrees for parallel Cascade tasks. Configure hooks in `.windsurf/hooks.json` to handle environment setup.

## Visual Studio Code — Customize AI

VS Code allows you to teach the AI about your codebase, coding standards, and workflows through various customization options.

### Customization Types
- **Custom Instructions**: Define project-wide rules and conventions.
  - **Always-on**: `.github/copilot-instructions.md`, `AGENTS.md`, or `CLAUDE.md`.
  - **File-based**: `*.instructions.md` targeting specific file types or folders.
- **Prompt Files**: Markdown files (`.prompt.md`) for repeatable tasks invoked via slash commands (e.g., `/create-react-form`).
- **Custom Agents**: Define specialized personas (e.g., security reviewer, planner) in `.agent.md` files with specific behaviors and tools.
- **Agent Skills**: Folders containing `SKILL.md` and supporting resources (scripts, templates) for complex tasks.
- **MCP Servers**: Connect external tools and data through the Model Context Protocol.

### Instruction Priority
1. **Personal Instructions**: User-level (highest priority).
2. **Repository Instructions**: `.github/copilot-instructions.md` or `AGENTS.md`.
3. **Organization Instructions**: GitHub organization-level (lowest priority).

### Discovery in Monorepos
Enable `chat.useCustomizationsInParentRepositories` to discover customization files in parent directories up to the `.git` root.

### Skill & Agent Structure
- **Skills**: `.github/skills/<name>/SKILL.md` or `~/.copilot/skills/<name>/SKILL.md`.
- **Agents**: `.github/agents/<name>.agent.md` or `~/.copilot/agents/<name>.agent.md`.
- **Standard**: Follows the [Agent Skills](https://agentskills.io) open standard.

## Codex — Subagents & Parallel Workflows

Codex handles complex tasks by spawning specialized subagents in parallel and collecting their results.

### Core Concepts
- **Subagents**: Specialized agents spawned for parallel execution (e.g., codebase exploration, multi-step planning).
- **Custom Agents**: TOML-based configurations for personal (`~/.codex/agents/`) or project-scoped (`.codex/agents/`) agents.
- **Batched Jobs**: `spawn_agents_on_csv` for processing many similar tasks across rows in a CSV.

### Built-in Agents
- `default`: General-purpose fallback.
- `worker`: Execution-focused for implementation and fixes.
- `explorer`: Read-heavy codebase exploration.

### Custom Agent Schema (TOML)
Standalone custom agent files must define:
- `name`: Identifier used for spawning.
- `description`: Human-facing guidance.
- `developer_instructions`: Core behavior directives.

### Global Settings
Configured under `[agents]` in `config.toml`:
- `max_threads`: Concurrent agent thread cap (default: 6).
- `max_depth`: Nesting depth (default: 1).
- `job_max_runtime_seconds`: Timeout for CSV fan-out jobs.

### Typical Workflow
1. **Explicit Spawn**: Codex only spawns agents when explicitly requested (e.g., "Spawn one agent per point...").
2. **Orchestration**: Codex manages routing, results collection, and thread closure.
3. **Approvals**: Subagents inherit the parent's sandbox policy and live runtime overrides.

### File Locations
- **Project**: `.codex/agents/<name>.toml`
- **Global**: `~/.codex/agents/<name>.toml`

### Display Nicknames
Use `nickname_candidates` in the TOML file to assign readable, distinct labels to spawned agent instances in the UI.

## Junie — Skills, Subagents & Guidelines

Junie provides task-specific context through a tiered system of Agent Skills and specialized subagents.

### Agent Skills
Agent Skills are on-demand folders containing instructions, templates, and scripts.
- **Project Scope**: `.junie/skills/<name>/SKILL.md`.
- **User Scope**: `~/.junie/skills/<name>/SKILL.md` (macOS/Linux) or `%USERPROFILE%\.junie\skills\<name>\` (Windows).
- **Format**: Markdown with YAML frontmatter (`name`, `description`).

### Custom Subagents
Subagents extend Junie's logic with tailored system prompts and tool restrictions.
- **Locations**: `.junie/agents/` (Project) or `~/.junie/agents/` (User).
- **Tool Groups**: Read, Bash, Glob, Grep, Write, Edit, WebSearch, AskUserQuestion.
- **Automatic Delegation**: Junie delegates tasks based on the subagent's name and description.

### Guidelines (AGENTS.md)
Junie uses `AGENTS.md` for persistent, reusable project context.
- **Discovery Order**: `.junie/AGENTS.md` → `AGENTS.md` → `.junie/guidelines/`.

### Custom Slash Commands
Create frequently used prompts via `/commands`.
- **Format**: Markdown files with YAML frontmatter (`description`).
- **Arguments**: Supports `$argumentName` in prompt templates.

### Custom LLMs
Integrate with local providers (Ollama) or proxies via JSON profiles in `.junie/models/`.

## Trae AI — Adaptive Rules & Skills

Trae AI uses a tiered system of Rules and Skills to provide context-aware assistance without bloating the context window.

### Core Features
- **Rules**: Always-on behavioral guidelines.
  - **User Rules**: Global preferences across all projects.
  - **Project Rules**: Specific to the current project, stored in `.trae/rules/`.
- **Skills**: On-demand procedural knowledge packaged in `SKILL.md` files.
- **AGENTS.md**: Native support for project-level behavioral guidance.
- **Git Commit Rules**: Specialized rules for generating high-quality commit messages via `scene: git_message`.

### Rule Activation Modes
- **Always Apply**: Injected into every chat.
- **Apply to Specific Files**: Triggered by glob patterns (e.g., `src/**/*.ts`).
- **Apply Intelligently**: AI decides based on the task description.
- **Apply Manually**: Invoked using `#Rule` in chat.

### Skill Structure
Trae follows the [Agent Skills](https://agentskills.io) open standard:
- **Project Skills**: `.trae/skills/<name>/SKILL.md`
- **Global Skills**: `~/.trae/skills/<name>/SKILL.md`

### Directory Recursion
Trae supports up to 3 levels of nested directories in `.trae/rules/` for clean organization. It also reads `.trae/rules/` in subdirectories for module-specific isolation.

## Mistral AI Vibe — Conversational CLI & Skills

Vibe is a high-performance command-line coding assistant that provides a conversational interface to your codebase.

### Core Features
- **Interactive Chat**: Conversational AI agent that breaks down complex tasks into tool calls.
- **Agent Profiles**: Choose from `default` (approval-based), `plan` (read-only), `accept-edits`, or `auto-approve`.
- **Subagents & Tasks**: Delegate background work using the `task` tool (e.g., `vibe --agent explore`).
- **Interactive Questions**: Agent can ask clarifying questions with pre-defined options via `ask_user_question`.
- **Safety First**: Trust folder system prevents execution in sensitive directories.

### Skills System
Extend Vibe's functionality using the Agent Skills specification.
- **Locations**: `.agents/skills/`, `.vibe/skills/`, and global `~/.vibe/skills/`.
- **Format**: `SKILL.md` with YAML frontmatter. Supports custom tools and slash commands.

### Configuration
Vibe is configured via `config.toml`.
- **Model Registry**: Customize `active_model`, `enabled_tools`, and `disabled_tools`.
- **MCP Servers**: Connect to external tools via the Model Context Protocol (HTTP or stdio).

### Commands
- `vibe` — Start interactive session.
- `vibe --agent plan` — Exploration mode.
- `vibe --continue` — Resume last session.

## Platform Ecosystem Directory

Initra integrates with a vast landscape of modern AI coding agents and platforms. Each platform has specific strengths, ranging from terminal-based CLI tools to full-featured cloud IDEs.

| Platform | Description | Role |
|----------|-------------|------|
| **Claude** | Anthropic's AI built for problem solvers. Tackle complex challenges, analyze data, and write code. | Reasoning & Logic |
| **OpenAI Codex** | OpenAI's coding agent for software development and complex orchestration. | Orchestration |
| **Mistral AI Vibe** | Conversational CLI interface to your codebase powered by Mistral's models. | CLI Explorer |
| **TRAE** | Adaptive AI IDE that collaborates with you to transform development velocity. | Adaptive IDE |
| **Ona** | Cloud-based platform for background agents running a team of AI engineers. | Cloud Agents |
| **Factory** | AI-native software development platform for refactors, migrations, and CI/CD. | Droid Platform |
| **Autohand Code CLI** | Autonomous LLM-powered coding agent using the ReAct (Reason + Act) pattern. | Terminal Agent |
| **Gemini CLI** | Open-source agent bringing the power of Google Gemini directly into your terminal. | Terminal Agent |
| **Databricks Genie** | Autonomous AI partner purpose-built for data work in Databricks. | Data Specialist |
| **Laravel Boost** | Guidelines and agent skills for writing high-quality Laravel applications. | Framework Expert |
| **Cursor** | AI editor and coding agent for building features, fixing bugs, and reviews. | AI-Native Editor |
| **Emdash** | Desktop app for running multiple coding agents in parallel in isolated worktrees. | Parallel Runner |
| **Amp** | Frontier coding agent designed to wield the full power of leading LLMs. | Frontier Agent |
| **Letta** | Platform for building stateful agents with advanced, self-improving memory. | Stateful Memory |
| **Workshop** | Cross-platform agent for building full applications with sub-agent support. | Multi-Agent Hub |
| **Spring AI** | Streamlined development for applications incorporating AI functionality. | Java/Spring Expert |
| **Piebald** | Desktop & web app for agentic development with complete configuration control. | Control Center |
| **Agentman** | Agentic healthcare platform automating revenue cycle workflows. | Healthcare Vertical |
| **AI Edge Gallery** | Google destination for running powerful open-source LLMs on mobile devices. | Mobile Edge |
| **VS Code** | The standard code editor for core edit-build-debug cycles. | Core Editor |
| **OpenCode** | Open source agent for terminal, IDE, and desktop environments. | Open Platform |
| **GitHub Copilot** | Editor-integrated suggestions and chat-based implementation partner. | Pair Programmer |
| **Command Code** | Neuro-symbolic AI agent that continuously learns your specific coding taste. | Personalized Agent |
| **Goose** | Open source, extensible AI agent that installs, executes, edits, and tests. | Extensible Agent |
| **VT Code** | Open-source coding agent with LLM-native understanding and shell safety. | Safety-First Agent |
| **Kiro** | Structure-focused agent bringing spec-driven development to AI coding. | Spec Specialist |
| **Firebender** | Android-native coding agent that writes and tests features in emulators. | Android Expert |
| **Junie** | LLM-agnostic coding agent built on the IntelliJ platform for deep project understanding. | JetBrains Agent |
| **Qodo** | Agentic code integrity platform for reviewing, testing, and writing code. | Quality Guard |
| **Snowflake Cortex** | Intelligent agent for data engineering, analytics, and machine learning. | Snowflake Expert |
| **fast-agent** | Simple, extendable interaction tool for coding, evals, and skills development. | Tooling Expert |
| **nanobot** | Ultra-lightweight personal agent for terminal, Telegram, Discord, and Slack. | Multi-Channel Agent |
| **Mux** | Browser-based runner for parallel coding agents with isolated workspaces. | Web-Based Runner |
| **Roo Code** | Editor-integrated AI dev team with deep project-wide context. | Team Orchestrator |
| **Claude Code** | Terminal-based agentic tool that reads, edits, and integrates with dev tools. | Terminal Agent |
| **pi** | Minimal terminal coding harness that adapts to your existing workflows. | Minimalist CLI |
| **OpenHands** | Open platform for scaling cloud coding agents model-agnostically. | Cloud Platform |

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

### 🟢 Phase 12: Nuxt 4 (Vue.js) (Complete)

43. **Nuxt 4 Heuristic Archetypes (Complete)**: Detection of `layouts/`, `pages/`, and `composables/`. (Done 2026-04-21)
44. **Nitro Segmentation (Complete)**: Identify Nitro API routes and server middleware. (Done 2026-04-21)
45. **Nuxt-specific Landmarks (Complete)**: Recognize `NuxtLayout` and `NuxtPage` entry points. (Done 2026-04-21)

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

### 📊 Phase 16: Autonomous Quality Audits (Complete)

55. **Heuristic Scorecard (Complete)**: Implementation of SEO, Security, and Performance audit rules. (Done 2026-04-21)
56. **UI Integration (Complete)**: Dynamic "Health Gauge" and check-list in the repo builder. (Done 2026-04-21)
57. **AI Auto-Repair Engine (Complete)**: Specialized prompt sequences for autonomous fixes. (Done 2026-04-21)

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

### 🟣 Phase 21: Expert Brain Overlays — UI Integration (Complete)

70. **Brain Selection Interface**: Dedicated wizard step for visual "Brain Profile" selection. (Done 2026-04-21)
71. **Intelligence Preview**: Live preview of behavioral directives during selection. (Done 2026-04-21)
72. **Spatial Awareness Dashboard**: Display identified repo landmarks in the project overview. (Done 2026-04-21)

### 🌐 Phase 22: AI Idea Fabric (Complete)

73. **Claude Opus 4.6 Migration**: Upgraded autonomous brainstorming to use the high-reasoning Opus 4.6 model. (Done 2026-04-21)
74. **Architectural Blueprints**: Refined generation prompt to produce high-fidelity technical justifications and work orders. (Done 2026-04-21)
75. **Persona-Aware Generation**: Daily ideas now include suggested Brain Overlays and Agent persona mappings. (Done 2026-04-21)

### 🚀 Phase 23: The "Hatch" Engine 2.0 (Complete)

76. **Granular Provisioning Status**: Real-time lifecycle logging for GitHub, Vercel, and Supabase. (Done 2026-04-21)
77. **Live Preview Orchestration**: Side-by-side workspace with embedded Vercel deployment iframe. (Done 2026-04-21)
78. **Deployment Monitoring Hook**: Automated status polling to detect when the venture is "READY". (Done 2026-04-21)

### 🛸 Phase 24: Command Center & Intelligence Layering (Complete)

79. **Intelligence Dual-Layering**: Decoupled Agent Brains (Behavioral Personas) from Tactical Workflows (Actionable Protocols) in the prompt engine. (Done 2026-04-21)
80. **Command Center Dashboard**: Unified "My Ventures" management hub with project deletion and repo disconnection tools. (Done 2026-04-21)
81. **Global Header Integration**: Standardized navigation and theme orchestration across the user dashboard. (Done 2026-04-21)

### 🌐 Phase 25: Community Ecosystem & Discovery (Complete)

82. **Venture Discovery Feed (Complete)**: Transformed the dashboard into a community hub. (Done 2026-04-21)
83. **Fork & Hatch Orchestration (Complete)**: Enabled forking and instant hatching. (Done 2026-04-21)
84. **Social Signals (Complete)**: Implemented engagement metrics (votes, forks) and trending score. (Done 2026-04-21)

### 📊 Phase 26: Autonomous Quality Audits (Complete)

85. **Pro Heuristic Scorecard (Complete)**: Implementation of deep SEO, Security, and Accessibility audit rules. (Done 2026-04-21)
86. **AI Auto-Repair Engine (Complete)**: Specialized prompt sequences for autonomous fixes. (Done 2026-04-21)
87. **Framework-Specific ADR Injection (Complete)**: Automated generation of ADRs based on audit findings. (Done 2026-04-21)

### 🌐 Phase 27: API & Service Integration Expansion (Complete)

88. **Layman Wizard Redesign (Complete)**: Automated backend package selection for beginners with curated architecture summaries. (Done 2026-04-22)
89. **Enterprise Service Catalog (Complete)**: Added 14+ new platforms spanning CMS (Sanity), Search (Algolia), Automation (Zapier), and Storage (AWS S3). (Done 2026-04-22)
90. **Strict Categorization (Complete)**: Expanded internal schema typing to support granular service categories in the Wizard UI. (Done 2026-04-22)

### 🚀 Phase 28: Enterprise Infrastructure Orchestration

91. **Service-Specific Boilerplate Injection (Complete)**: Auto-generate configurations (e.g., `sanity.config.ts`, Algolia client) for new SaaS platforms. (Done 2026-04-22)
92. **Advanced Venture Blueprints (Complete)**: Introduce "Enterprise E-Commerce" and other high-end templates pre-wired with specific CMS and Search APIs. (Done 2026-04-22)
93. **Connected Services Dashboard (Complete)**: Visual "Infrastructure Map" in the user Command Center displaying hooked-up SaaS tools per venture. (Done 2026-04-22)
94. **Webhooks & Automation Engine**: Ping user-defined webhooks (Zapier/Make) upon successful repository birth to trigger external workflows.

### 💡 Phase 29: Community Suggestions Expansion (Complete)

95. **Dual-Track Suggestions (Complete)**: Added capability to propose both Initra platform features and Project ideas with unified upvoting and distinct UI sections. (Done 2026-04-22)

### 🚀 Phase 30: Advanced Orchestration & Community Marketplace

96. **Advanced Full-Stack Authentication Templates**: Automatically inject fully working Login/Register UIs for Next.js configured with Supabase Auth into hatched ventures.
97. **Deep Venture Telemetry Dashboard**: Dedicated "Venture Detail" view in the Command Center showing live provisioning logs, webhook status, Vercel builds, and health scorecards.
98. **The Community Blueprint Marketplace**: Upgrade the Community Hub to allow users to "Fork & Tweak Blueprint", loading a community project's `generated_config` directly back into the project wizard.


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
