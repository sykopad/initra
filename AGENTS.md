# Initra — Initiate Infrastructure

> AI-powered project bootstrapping platform that generates tailored IDE agent configuration files.

<!-- BEGIN:nextjs-agent-rules -->
## Next.js 16 (Turbopack)

This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. 

### Proxy (formerly Middleware)

Starting with Next.js 16, **Middleware is now called Proxy**. 
- Create a `proxy.ts` (or `.js`) file in the project root or `src/`.
- Export a `proxy` function (or default export).
- Use `NextResponse` to modify requests/responses.

Example:
```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: '/about/:path*',
}
```

Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

**Initra** (Initiate Infrastructure) is a high-performance **Autonomous SaaS Builder** that empowers developers to create and manage applications on their own Git infrastructure. 

Positioned as a developer-first alternative to platforms like **Lovable** and **Base44**, Initra eliminates vendor lock-in by:
1. **Deep Repository Analysis**: Scans existing GitHub repos to identify UI segments (Headers, Pages, Layouts).
2. **SaaS Builder Mode (Creative Studio)**: Centralized command center to select and refine individual UI/Logic segments via high-fidelity AI prompts.
3. **Credit-Based Economy**: Tiered model registry (Claude 3.7, GPT-5) with performance-optimized pricing and structured production logging.
4. **Git Infrastructure Ownership**: All changes are pushed directly to the user's own repository, ensuring 100% code ownership.
5. **Sovereign AI Swarm 2.0**: Autonomous venture evolution, self-improving codebases, and specialized IDE rules via sovereign swarm topologies.
6. **Autonomous Quality Audit**: Post-hatch heuristic evaluation (SEO, Security, Next.js 16, and SPARC compliance) to ensure Gold Standard compliance.
7. **Sovereign Multi-Agent Governance**: DAO-based infrastructure management and strict SPARC enforcement for multi-pillar autonomous ventures.
8. **Community Skill Marketplace**: Peer-to-peer sharing of agentic capabilities, architectural patterns, and voting.
8. **Premium Design Presets**: High-fidelity typographic scales and surface-ladder architectures (Hairline Borders, Editorial Calm).
9. **Enterprise Multi-Tenant Scaffolding**: Organization-scoped routing (`/[orgSlug]`) and robust team-scoped data isolation (RLS) as a standard boilerplate option.
10. **Autonomous Performance Audit**: Post-hatch scale-readiness reporting and simulated load testing to ensure high-performance production stability.
11. **Global Sovereign Edge Deployment 2.0**: Multi-region Vercel configurations, multi-cloud edge synchronization, and Global Edge Network optimizations.
12. **Autonomous Chaos Engineering (Self-healing)**: Post-hatch resilience auditing and automated recovery playbooks to ensure self-healing, high-availability infrastructure.
13. **Sovereign Resilience 2.0**: Predictive failure detection and autonomous chaos orchestration for mission-critical multi-cloud stability.
14. **Sovereign Compliance Engine 3.0**: Autonomous regulatory patching, real-time industry-specific policy enforcement (HIPAA/GDPR), and continuous auditing.
15. **Multi-Region Database Sharding 3.0**: Dynamic shard orchestration, automated regional rebalancing, and cross-shard transaction coordinators.
16. **Autonomous Sovereign CI/CD**: Automated regional deployments, security scanning (SAST/DAST), and coordinated migration orchestration.
17. **Sovereign Security Guardrails 2.0**: Continuous vulnerability auditing, automated security patching, and hardened WAF configurations.
18. **Autonomous Sovereign Scalability**: High-performance, demand-aware infrastructure scaling for compute and database resources.
19. **Sovereign AI Gateway**: Privacy-preserving AI orchestration, model fallbacks, and Edge-level prompt caching for enterprise ventures.
20. **Sovereign Observability 2.0**: Distributed tracing, AI-driven performance insights, and real-time observability dashboards.

## Tech Stack

- **Framework**: Next.js 16.2.4 with App Router (Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Vanilla CSS with custom design system (`globals.css`)
- **Logging**: Pino (structured JSON)
- **Database**: Supabase (PostgreSQL) — custom `initra` schema
- **Auth**: Supabase Auth (implemented)
- **Deployment**: Vercel (implemented)

### ⚙️ Vercel Integration Setup

To enable deep Telemetry and Autonomous Hatching, you need to provide a Vercel Access Token:
1. Go to your **[Vercel Settings > Tokens](https://vercel.com/account/tokens)**.
2. Click **Create** to generate a new Personal Access Token.
3. Add it to your `.env.local` as `VERCEL_TOKEN`.
4. (Optional) If you are part of a team, add your `VERCEL_TEAM_ID` (found in team settings).

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

### AI & Credits (`src/lib/ai/` & `src/lib/credits/`)

| File | Purpose |
|------|---------|
| `models.ts` | Centralized AI Model Registry (pricing, context, slugs) |
| `openrouter.ts` | Tiered model selection and OpenRouter API client |
| `service.ts` | Credit management, deduction, and transaction logging |
| `logger.ts` | Structured Pino logging for usage and auditability |

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

## Factory — Skills, Droids & Commands

Factory is an AI-native software development platform that leverages specialized "Droids" and reusable "Skills" to automate complex engineering workflows.

### Skills System
Skills are reusable capabilities that extend what your Droid can do.
- **Locations**: `.factory/skills/` (Workspace), `~/.factory/skills/` (Personal), and `.agent/skills/` (Compatibility).
- **Format**: `SKILL.md` or `skill.mdx` with YAML frontmatter.
- **Invocation**: Both you (via `/skill-name`) and the Droid (automatically based on relevance) can invoke skills.

### Custom Droids (Subagents)
Create specialized subagents with unique prompts, tool access, and model preferences.
- **Discovery**: Scanned from `.factory/droids/` and `~/.factory/droids/`.
- **Inheritance**: Project-level definitions override personal ones.
- **Tool Categories**: `read-only` (analysis), `edit` (generation), `execute` (shell), `web` (research), and `mcp`.

### Custom Slash Commands
Turn repeatable prompts or setup steps into `/shortcuts`.
- **Workspace**: `.factory/commands/` for project-specific shared commands.
- **Markdown Commands**: Render into system notifications with `$ARGUMENTS` support.
- **Executable Commands**: Scripts starting with a shebang for direct shell execution.

## Ona — Cloud-based Background Agents

Ona is a platform for background agents that run as a team of AI software engineers in the cloud, orchestrated and secured at the kernel.

### Codebase Context (AGENTS.md)
Ona Agent uses `AGENTS.md` to understand project conventions, commands, and architecture.
- **Scope**: Supports nested `AGENTS.md` files in monorepos; agents read the nearest file in the tree.
- **Optimization**: Recommended length is under 300 lines (ideal < 60 lines) for maximum instruction-following quality.

### Agent Skills
Skills are `SKILL.md` files containing step-by-step workflow instructions for repeatable tasks.
- **Repository Skills**: Stored in `.ona/skills/<name>/SKILL.md`. Discovered automatically by description.
- **Organization Skills**: Reusable prompts managed at the organization level, optionally available as slash commands.

### Automation & Notifications
- **Webhooks**: Agents can be instructed to run `curl` commands or background tasks upon completion.
- **WatchEvents API**: Programmatic monitoring of task completion and agent lifecycle events.

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

### The SPARC Methodology (Development Cycle)

All agents must follow the SPARC cycle for any non-trivial task:
1. **Specification (S)**: Define requirements, constraints, and success criteria.
2. **Pseudocode (P)**: Plan the logic in natural language before writing code.
3. **Architecture (A)**: Design the system structure and component interfaces.
4. **Refinement (R)**: Implement with a test-first approach (TDD).
5. **Completion (C)**: Finalize documentation, capture knowledge, and verify.

**SPARC Mode**: When enabled, the generation engine enforces these phases via mandatory directives in all subagent instructions.

### Behavioral Rules (Always Enforced)

- **NEVER** leap into coding without a written **Specification** and **Pseudocode** phase.
- **NEVER** modify migrations without explicit confirmation from the Architect agent.
- **ALWAYS** read a file's current state before proposing an edit.
- **ALWAYS** follow the "Progressive Disclosure" standard for skills and documentation.
- **ALWAYS** use structured JSON logging (Pino) for any backend service implementation.
- NEVER create files unless they are absolutely necessary for achieving the goal.
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested.
- NEVER save working files, text/mds, or tests to the root folder — use the correct subdirectory.
- NEVER commit secrets, credentials, `.env`, or `.env.local` files.

### Code Quality

- Use TypeScript strict mode. Avoid `any`.
- Use named exports, never default exports (except page components).
- Keep functions small and focused. Use early returns to reduce nesting.
- Keep files under 500 lines. Split when approaching the limit.
- Component styling uses the CSS design system in `globals.css` — no inline Tailwind.
- Use parameterized queries. NEVER interpolate user input into SQL.

### Database & Schema

- All database tables are in the `initra` schema, NOT `public`.
- Use `extensions.uuid_generate_v4()` for UUIDs in SQL (Supabase puts extensions in the `extensions` schema).
- Never expose secrets or service keys client-side.
- Never modify migration files without asking.

### Workflow

- Ask before installing new dependencies.
- Check existing patterns before creating new abstractions.
- All community data and wizard sessions are stored in Supabase via the `initra` schema.
- Batch related operations together — avoid unnecessary round-trips.

## Multi-Agent Orchestration

Initra generates agent configurations for **all modern IDEs** — not just one. This section defines the cross-IDE orchestration philosophy that powers our generation engine.

### Orchestration Philosophy

Initra operates at three levels:

```
Level 1: Single Agent — One IDE agent with generated rules (CLAUDE.md, .cursor/rules/, etc.)
Level 2: Agent Team  — Multiple specialized agents within a single IDE (subagents, skills)
Level 3: Cross-IDE   — Agents across different IDEs collaborating on the same repository
```

### Agent Role Definitions

Standard agent roles that Initra generates configurations for:

| Role | Responsibility | Best IDE Match |
|------|---------------|----------------|
| **Architect** | System design, API contracts, schema decisions | Claude Code (deep reasoning) |
| **Coder** | Implementation, feature building, refactoring | Cursor (fast generation) |
| **Tester** | Test writing, coverage analysis, edge cases | Codex (bulk transforms) |
| **Reviewer** | Code quality, security review, best practices | Claude Code (careful analysis) |
| **Coordinator** | Task routing, progress tracking, orchestration | Any IDE with subagent support |
| **Researcher** | Codebase analysis, dependency audit, documentation | Gemini CLI (large context) |

### Task Complexity Detection

**Spawn multi-agent coordination when the task involves:**
- Multiple files (3+) or cross-module changes
- New feature implementation with tests
- Refactoring across modules
- Security-related changes
- Performance optimization
- Database schema changes

**Use single-agent mode for:**
- Single file edits or simple bug fixes (1–2 lines)
- Documentation updates
- Configuration changes
- Quick questions or exploration

### Swarm Topologies

1. **Mesh (Peer-to-Peer)**: Equal peers with distributed decision-making. Best for collaborative features where front-end and back-end are tightly coupled.
2. **Hierarchical (Queen-Worker)**: A central Supervisor (Architect) delegates to specialized Workers (Coder, Tester). Best for large, complex feature builds.
3. **Adaptive (Dynamic)**: The orchestration logic automatically switches topology based on task complexity and agent availability.

**Sovereign UI**: Topologies can be configured and previewed visually in the **Project Wizard (Step 7)**.

### Communication Patterns (Handovers)

**Pipeline** — Sequential handoff between specialized agents:
```
architect → coder → tester → reviewer
```
Each agent completes its work and passes context to the next.

**Fan-out / Fan-in** — Parallel work with synthesis:
```
         ┌→ researcher-1 ──→┐
lead ────┼→ researcher-2 ──→├──→ lead synthesizes
         └→ researcher-3 ──→┘
```

**Supervisor / Worker** — Central coordination with parallel execution:
```
coordinator ←→ coder-1
coordinator ←→ coder-2
coordinator ←→ tester-1
```

### Cross-IDE Orchestration

When generating configs for multi-IDE teams, route tasks to optimal platforms:

| Task Type | Optimal Platform | Reason |
|-----------|-----------------|--------|
| Architecture & design | Claude Code | Strong reasoning, system thinking |
| Implementation | Cursor / Codex | Fast code generation, inline editing |
| Security review | Claude Code | Careful analysis, threat modeling |
| Performance tuning | Codex | Code-level optimizations |
| Testing strategy | Claude Code / Junie | Coverage analysis, edge cases |
| Bulk refactoring | Codex / Cursor | Mass code transforms |
| Documentation | Windsurf / Copilot | Context-aware, memory-persistent |

### Skills Catalog

Initra's skills extend the prompt engine with specialized workflows:

| Skill | Location | Purpose |
|-------|----------|---------|
| `blueprint-builder` | `.agents/skills/blueprint-builder/` | Guide for creating high-fidelity Venture Blueprints |
| `engine-debugger` | `.agents/skills/engine-debugger/` | Debugging and expanding the deterministic prompt engine |
| `agent-team-builder` | `.agents/skills/agent-team-builder/` | Multi-agent team blueprint generation and orchestration |
| `skill-builder` | `.agents/skills/skill-builder/` | Create and manage Initra-compliant Agent Skills |

Future skills to develop:
- `ide-config-generator` — Cross-IDE configuration synthesis
- `service-integration` — External API wiring and boilerplate
- `quality-audit` — Heuristic analysis and auto-repair
- `github-orchestration` — Repository provisioning and CI/CD
- `template-expansion` — Adding new framework templates to the engine

### Skills Development Guide

To create a new Initra skill:

1. Create a folder under `.agents/skills/<skill-name>/`
2. Add a `SKILL.md` with YAML frontmatter:
   ```markdown
   ---
   name: skill-name
   description: When to invoke this skill and what it does.
   ---
   # Skill Instructions
   Step-by-step guidance, examples, and procedural knowledge.
   ```
3. Optionally add `scripts/`, `references/`, or `assets/` subdirectories.
4. Skills are auto-discovered by all IDEs that support the Agent Skills open standard.

**Skill categories for Initra's domain:**
- **Engine** — Prompt engine logic, template expansion, variable interpolation
- **IDE Config** — Per-IDE rule generation, activation modes, file formatting
- **Infrastructure** — GitHub, Vercel, Supabase orchestration and provisioning
- **Quality** — Heuristic audits, auto-repair, ADR generation
- **Community** — Blueprint publishing, voting, marketplace integration

## Agent Team Blueprints

Initra can generate **agent team configurations** alongside standard IDE rules. These blueprints define typed agent roles that IDEs with subagent support can directly consume.

### Claude Code Agent (YAML)

```yaml
# .claude/agents/architect.yaml
type: architect
capabilities:
  - system-design
  - api-design
  - schema-decisions
  - documentation
optimizations:
  - context-caching
  - memory-persistence
```

### Codex Agent (TOML)

```toml
# .codex/agents/coder.toml
name = "coder"
description = "Implementation-focused agent for feature building and refactoring."
developer_instructions = """
You are a senior TypeScript developer. Follow the project's Behavioral Rules.
Use the CSS design system in globals.css. Never use inline Tailwind.
Always read files before editing. Prefer editing over creating.
"""

[tools]
enabled = ["read", "write", "edit", "bash", "glob", "grep"]

[model]
preference = "fast"
```

### Cursor Subagent (MDC)

```markdown
---
name: reviewer
description: Code quality reviewer and security auditor
model: inherit
---
# Reviewer Agent
Review all changes for:
1. TypeScript strict mode compliance
2. SQL injection prevention (parameterized queries only)
3. Secret exposure (no client-side service keys)
4. CSS design system adherence (no inline styles)
5. File size limits (< 500 lines per file)
```

### Junie Subagent (Markdown)

```markdown
---
name: tester
description: Test writer and coverage analyzer
tools: [Read, Write, Edit, Bash, Grep]
---
# Tester Agent
Write comprehensive tests using Vitest for:
- Prompt engine interpolation and variable resolution
- Template version branching logic
- Package/service library lookups
- IDE formatter output validation
```

### Factory Droid (YAML)

```yaml
# .factory/droids/researcher.yaml
name: researcher
description: "Codebase explorer and dependency auditor"
model: inherit
tools:
  - read-only
  - web
instructions: |
  Analyze the repository structure and report:
  - Framework detection (Next.js, Nuxt, Django, Go, Flutter)
  - Dependency health (outdated, deprecated, vulnerable)
  - Segment identification (layouts, pages, components, API routes)
```

## Multi-Agent Recipes

Copy-paste orchestration patterns for common Initra development tasks.

### Recipe 1: Full-Stack Feature (Claude Code)

When building a complete feature (e.g., new wizard step):

```
1. [Architect Agent] — Design the data model, API contract, and component structure.
   → Output: Schema SQL, API route signature, component tree diagram.

2. [Coder Agent] — Implement the feature across all layers.
   → Parallel tasks:
     - Database migration (initra schema)
     - API route handler (src/app/api/)
     - React component (src/components/)
     - Engine integration (src/lib/engine/)

3. [Tester Agent] — Write Vitest unit tests and integration coverage.
   → Focus: Engine logic, API validation, component rendering.

4. [Reviewer Agent] — Audit for behavioral rule compliance.
   → Checklist: TypeScript strict, no `any`, parameterized SQL, CSS system.
```

### Recipe 2: Cross-IDE Blueprint Generation (Cursor + Codex)

When extending Initra's template engine for a new IDE target:

```
1. [Cursor: Research] — Explore the IDE's documentation and rule format.
   → Read official docs, extract activation modes, file paths, frontmatter schemas.

2. [Cursor: Architect] — Design the IDE formatter in src/lib/engine/ide-formatter.ts.
   → Define the output structure: file name, content template, metadata format.

3. [Codex: Implement] — Bulk-generate the formatter, tests, and type definitions.
   → Files: ide-formatter.ts, ide-targets.ts, __tests__/ide-*.test.ts.

4. [Cursor: Review] — Validate output against real IDE behavior.
   → Test by generating sample configs and verifying IDE loads them correctly.
```

### Recipe 3: Venture Hatching Pipeline (Single Agent, Multi-Step)

When hatching a new venture end-to-end:

```
Step 1: Blueprint Validation
  → Verify project template, stack selections, and service integrations.

Step 2: Infrastructure Provisioning (sequential)
  → GitHub repo creation → Vercel project → Supabase database → DNS assignment.

Step 3: Code Generation (parallel)
  → Boilerplate files + IDE agent configs + GitHub Actions + .env.example.

Step 4: Quality Audit
  → Run heuristic scorecard (SEO, Security, Performance).
  → Auto-repair any critical findings.

Step 5: Deployment Verification
  → Poll Vercel deployment status until "READY".
  → Run health checks (SSL, uptime, 500-errors).
```

## Memory & Learning Protocols

Guidelines for how AI agents should manage knowledge when working on Initra.

### Pattern Storage Philosophy

Initra generates configurations across **many ventures and stacks**. Agents should:

1. **Learn from repairs** — When an auto-repair succeeds, record the pattern (trigger → fix) for future reference.
2. **Cross-venture intelligence** — Patterns discovered in one venture (e.g., "Next.js 16 hydration fix") should be surfaceable when the same stack appears in another venture.
3. **Template evolution** — Successful generated configs should feed back into the engine's template library.

### Agent Memory Hierarchy

```
L1: Session Memory   — Current conversation context (ephemeral)
L2: Project Memory   — Per-venture patterns, repairs, and decisions (persistent)
L3: Platform Memory  — Cross-venture intelligence shared across the user's portfolio (persistent)
L4: Community Memory — Anonymized patterns shared via the Community Blueprint Marketplace (future)
```

### Anti-Drift Protocols

To prevent agents from deviating during long sessions:

- **Checkpoint after every 10 tasks** — Summarize completed work and remaining objectives.
- **Re-read Behavioral Rules** — Before any destructive operation (delete, overwrite, schema change).
- **Validate against the generation engine** — Ensure manual edits don't conflict with engine-generated output.
- **File-before-edit rule** — ALWAYS read the current state of a file before proposing changes.

## Roadmap

> 📋 **Completed phases (1–33)** are documented in [`docs/ROADMAP.md`](docs/ROADMAP.md).

### Active & Planned

- **Webhooks & Automation Engine**: Ping user-defined webhooks (Zapier/Make) upon successful repository birth to trigger external workflows.
- **The Community Blueprint Marketplace**: Upgrade the Community Hub to allow users to "Fork & Tweak Blueprint".
- **Venture Economy Expansion**:
    - Automated Monthly Stipend: Supabase Edge Function to auto-refill Pro credits on billing anniversaries.
    - Team Subscriptions: $99/mo plans for organizations to manage shared infrastructure and credits.
- **Multi-Venture Knowledge Sharing**: Cross-repository intelligence where agents learn from previous repairs across all projects in a user's portfolio.

### Framework Roadmap

We implement frameworks **one at a time** to ensure maximum accuracy and deep heuristic analysis.

| Framework | Status | Methodology |
|-----------|--------|-------------|
| **Next.js 16 (App Router)** | ✅ Deep | Full layout/page/component segmentation & targeted editing. |
| **Nuxt 4 (Vue.js)** | ✅ Deep | Composition API heuristics and directory-based segmentation. |
| **Django 6** | ✅ Deep | MVT segmentation and template landmark detection. |
| **Go (Gin/Axum)** | ✅ Deep | Route recognition, domain clustering, template parsing. |
| **Flutter 4** | ✅ Deep | Widget tree analysis, state management heuristics. |


## Autohand — Adaptive Continuous Engineering

> Autonomous code evolution powered by evolutionary software engineering.

**Autohand** is an autonomous AI software engineer with self-evolving capabilities. It provides Level 5 programming autonomy, enabling multi-file editing, agentic search, and continuous code evolution.

### Autonomy Levels

Autohand helps teams reach Level 5 autonomy through its specialized tools:
- **L1 Assisted**: Autocomplete patterns.
- **L2 Partial**: Writing blocks with human approval.
- **L3 Conditional**: Feature implementation with oversight.
- **L4 High**: Autonomous application development.
- **L5 Full**: Software that evolves itself via evolutionary optimization.

### Core Tools

| Tool | Purpose |
|------|---------|
| **Autohand Code** | Self-evolving code agent for CLI, VS Code, and Zed Editor. Orchestrates agent teams to ship features autonomously. |
| **Autohand Evolve** | Deploys self-improving agents that continuously discover, test, and optimize algorithms using evolutionary algorithms. |
| **Autohand CLI** | Terminal-based orchestration hub for autonomous software engineering. |

### Configuration

Initra generates the `autohand.json` configuration file to bootstrap your autonomous engineering environment:

```json
{
  "project": "venture-name",
  "autonomy_level": 5,
  "evolve": {
    "enabled": true,
    "ground_truth_eval": "tests/performance",
    "infrastructure": "cloud-agnostic"
  },
  "agents": {
    "orchestrator": "autohand-code",
    "specialists": ["technical-debt", "legacy-migration", "autonomous-sre"]
  }
}
```

## Databricks Genie Code — Data & AI Partner

> Autonomous AI partner purpose-built for data work in Databricks.

**Databricks Genie Code** automates common Databricks workflows, from data exploration in Unity Catalog to building ML pipelines. It supports custom instructions and extensible agent skills.

### Custom Instructions

Genie Code automatically discovers and reads `AGENTS.md` and `CLAUDE.md` files in your workspace. 
- **Workspace Instructions**: Configured in `.assistant_workspace_instructions.md` by admins for organization-wide standards.
- **User Instructions**: Personal preferences stored in `.assistant_instructions.md`.
- **Auto-Discovery**: Genie Code walks up the directory tree to inject all found instruction files into its context.

### Agent Skills

Extend Genie Code with specialized capabilities following the **Agent Skills** open standard.
- **Location**: `.assistant/skills/` (Workspace or User directories).
- **Structure**: Each skill requires a dedicated folder containing a `SKILL.md` file with YAML frontmatter (`name`, `description`).
- **Capabilities**: Skills can include step-by-step guidance, reusable code, and executable scripts for model deployment or ETL patterns.

## Laravel Boost — Laravel Infrastructure

> Guidelines and agent skills for writing high-quality Laravel applications.

**Laravel Boost** provides a systematic way to give AI agents context about your application through a combination of global guidelines and on-demand skills.

### Guidelines vs. Skills

| Aspect | Guidelines | Skills |
|--------|------------|--------|
| **Loaded** | Upfront, always present | On-demand, when relevant |
| **Scope** | Broad, foundational Laravel conventions | Focused, task-specific implementation patterns |
| **Location** | `.ai/guidelines/` | `.ai/skills/` |

### Agent Skills

Laravel Boost skills are lightweight, targeted knowledge modules that reduce context bloat.
- **On-Demand Activation**: Skills are only loaded when relevant to the current task (e.g., Livewire components, Pest tests).
- **Auto-Discovery**: `boost:install` detects packages in `composer.json` and installs matching skills (e.g., `livewire-development`).
- **Customization**: Create your own skills in `.ai/skills/{skill-name}/SKILL.md` or override built-in ones by matching names.

## Agent Skills — The Open Standard

> A simple, open format for giving agents new capabilities and expertise.

**Agent Skills** is an open format (originally developed by Anthropic) for extending AI agent capabilities with specialized knowledge and workflows. It is supported by a growing ecosystem including **Claude Code**, **Cursor**, **Junie**, **Factory**, **Databricks Genie**, and **Laravel Boost**.

### Core Concept: Progressive Disclosure

Claude Code uses a **3-level progressive disclosure system** to scale to 100+ skills without context penalty:

1. **Level 1: Metadata (Name + Description)**: Always loaded. Enables autonomous skill matching with minimal token usage.
2. **Level 2: SKILL.md Body**: Loaded only when a task matches the skill's description. Contains primary instructions and procedures.
3. **Level 3: Referenced Assets**: Loaded on-demand as the agent navigates. Includes deep docs (`docs/`), examples (`examples/`), and scripts (`scripts/`).

### SKILL.md Specification

Every skill is a folder containing a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: skill-identifier
description: Describes what the skill does and when to use it.
---

# Skill Instructions
Step-by-step guidance, examples, and procedural knowledge go here.
```

### Directory Structure

```directory
my-skill/
├── SKILL.md          # Required: instructions + metadata
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
└── assets/           # Optional: templates, resources
```


> **Note:** Coding conventions and project boundaries are defined in the [Behavioral Rules](#behavioral-rules-always-enforced) section above.

