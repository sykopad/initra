<p align="center">
  <strong>⚡ Initra</strong><br/>
  <em>Initiate Infrastructure</em>
</p>

<p align="center">
  AI-powered project bootstrapping platform that generates tailored IDE agent configuration files.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#supported-ides">IDEs</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#community">Community</a>
</p>

---

## What is Initra?

**Initra** helps developers bootstrap any project with the right AI agent configuration. Walk through a guided wizard, select your tech stack, pick your IDE, and instantly generate production-ready agent files — no LLM calls, no latency, completely deterministic.

Stop spending hours writing `CLAUDE.md` or `.cursorrules` from scratch. Let Initra generate them perfectly for your exact setup.

## Features

- **🧙‍♂️ 5-Step Wizard** — Project type → Stack config → IDE selection → Review → Export
- **⚡ Instant Generation** — Pure TypeScript engine, zero LLM latency
- **📦 6 Project Templates** — Next.js, React Native, FastAPI, Flutter, Express, Python ML
- **🎯 6 IDE Targets** — Claude Code, Cursor, Windsurf, Gemini, GitHub Copilot, Universal
- **📥 ZIP Download** — All files in the correct directory structure
- **🌍 Community Hub** — Suggest open-source projects, vote on ideas, contribute agent configs
- **🎨 Premium UI** — Dark theme, glassmorphism, smooth animations

## Supported IDEs

| IDE | Output File | Format |
|-----|-------------|--------|
| Claude Code | `CLAUDE.md` | Markdown |
| Cursor | `.cursor/rules/*.mdc` | YAML frontmatter + Markdown |
| Windsurf | `.windsurf/rules/*.md` | Markdown |
| Gemini | `GEMINI.md` | Markdown |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |
| Universal | `AGENTS.md` | Markdown |

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/sykopad/initra.git
cd initra

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## Architecture

### Prompt Generation Engine

A **pure, deterministic TypeScript pipeline** — no LLM calls:

```
WizardConfig → Template Resolver → Variable Extractor → Prompt Composer → IDE Formatter → GeneratedFile[]
```

### Tech Stack

- **Framework**: Next.js 16 with App Router (Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Vanilla CSS with custom design system
- **Database**: Supabase (PostgreSQL) — custom `initra` schema
- **Auth**: Supabase Auth (planned)
- **Deployment**: Vercel (planned)

### Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with SEO
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Design system
│   ├── wizard/page.tsx         # 5-step wizard
│   ├── community/page.tsx      # Community hub
│   ├── shared/[slug]/page.tsx  # Shared config viewer
│   └── api/
│       ├── generate/route.ts   # POST — generation API
│       └── community/route.ts  # GET/POST — community CRUD
└── lib/
    ├── engine/                 # Prompt generation engine
    │   ├── types.ts            # TypeScript interfaces
    │   ├── templates.ts        # 6 project templates
    │   ├── ide-targets.ts      # 6 IDE configurations
    │   ├── prompt-composer.ts  # Template engine
    │   ├── ide-formatter.ts    # IDE-specific formatting
    │   └── index.ts            # Main entry point
    └── supabase/
        ├── client.ts           # Browser client
        └── server.ts           # Server client
```

## Database

All tables live in the `initra` schema on Supabase (not `public`). See [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) for the full schema with 10 tables, RLS policies, and triggers.

## Community

Initra includes a community hub where developers can:

- **Suggest** open-source projects that benefit humanity
- **Vote** on project ideas (upvote/downvote)
- **Contribute** agent configuration files for community projects
- **Filter** by status: Proposed, In Progress, Needs Agents, Completed

## Contributing

Contributions are welcome! Please check existing patterns before creating new abstractions.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for the developer community
</p>
