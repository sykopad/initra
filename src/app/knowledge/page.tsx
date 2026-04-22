"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const IDE_GUIDES = [
  {
    slug: "antigravity",
    name: "Google Antigravity",
    icon: "🚀",
    content: (
      <>
        <h3>Advanced Agent Orchestration</h3>
        <p>Google Antigravity is the next evolution in agentic coding, offering a hierarchical structure for rules, workflows, and skills.</p>
        
        <div className="guide-section">
          <h4>📁 Folder Structure</h4>
          <pre className="code-block">
{`.agents/
├── rules/          # Workspace-specific constraints
├── workflows/      # Repeatable /slash commands
└── skills/         # Specialized knowledge packages`}
          </pre>
        </div>

        <div className="guide-section">
          <h4>📜 Rules</h4>
          <p>Rules allow you to guide the agent to follow behaviors particular to your own use cases and style.</p>
          <ul>
            <li><strong>Global Rules</strong>: ~/.gemini/GEMINI.md</li>
            <li><strong>Workspace Rules</strong>: .agents/rules/</li>
            <li><strong>Activation</strong>: Can be Manual, Always On, Model Decision, or Glob patterns.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🔄 Workflows</h4>
          <p>Define a series of steps to guide the Agent through repetitive tasks. Save as markdown and invoke with <code>/workflow-name</code>.</p>
        </div>

        <div className="guide-section">
          <h4>🛠️ Skills</h4>
          <p>Reusable packages of knowledge that extend what the agent can do. Each skill contains a <code>SKILL.md</code> with YAML frontmatter.</p>
        </div>
      </>
    )
  },
  {
    slug: "cursor",
    name: "Cursor",
    icon: "⚡",
    content: (
      <>
        <h3>Cursor Rules (.mdc)</h3>
        <p>Cursor uses <code>.mdc</code> files with YAML frontmatter to define rules that can be automatically applied based on file path or model decision.</p>
        <div className="guide-section">
          <h4>Setup</h4>
          <ol>
            <li>Place generated <code>.mdc</code> files in <code>.cursor/rules/</code>.</li>
            <li>Cursor will detect them and apply the context during your chat or composer sessions.</li>
          </ol>
        </div>
      </>
    )
  },
  {
    slug: "claude",
    name: "Claude Code",
    icon: "🟣",
    content: (
      <>
        <h3>CLAUDE.md & Agent Skills</h3>
        <p>Claude Code reads <code>CLAUDE.md</code> at session start, but you can also extend its power using <strong>Agent Skills</strong>.</p>
        
        <div className="guide-section">
          <h4>💡 What are Skills?</h4>
          <p>Skills extend what Claude can do. Create a <code>SKILL.md</code> file with instructions, and Claude adds it to its toolkit.</p>
          <ul>
            <li><strong>Project Skills</strong>: <code>.claude/skills/&lt;name&gt;/SKILL.md</code></li>
            <li><strong>Personal Skills</strong>: <code>~/.claude/skills/&lt;name&gt;/SKILL.md</code></li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🛠️ Creating a Skill</h4>
          <p>Every skill needs YAML frontmatter and Markdown content. The <code>name</code> field becomes the <code>/slash-command</code>.</p>
          <pre className="code-block">
{`---
name: explain-code
description: Explains code with visual diagrams.
---

When explaining code, always include:
1. An analogy from everyday life.
2. An ASCII art diagram.
3. A step-by-step walkthrough.`}
          </pre>
        </div>

        <div className="guide-section">
          <h4>🔄 Dynamic Substitutions</h4>
          <p>Skills support dynamic values like <code>$ARGUMENTS</code> (all inputs), <code>$0</code>, <code>$1</code> (indexed arguments), and <code>\${CLAUDE_SESSION_ID}</code> for session-specific logging.</p>
        </div>

        <div className="guide-section">
          <h4>⚙️ Configuration (Frontmatter)</h4>
          <p>Control how your skill behaves using YAML fields:</p>
          <ul>
            <li><code>disable-model-invocation</code>: Set to <code>true</code> for manual <code>/slash</code> commands only.</li>
            <li><code>user-invocable</code>: Set to <code>false</code> for background knowledge.</li>
            <li><code>context: fork</code>: Run the skill in an isolated subagent.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>📂 Where Skills Live</h4>
          <table className="knowledge-table" style={{ width: "100%", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Scope</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Path</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "0.5rem" }}>Project</td>
                <td style={{ padding: "0.5rem" }}><code>.claude/skills/&lt;name&gt;/SKILL.md</code></td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem" }}>Personal</td>
                <td style={{ padding: "0.5rem" }}><code>~/.claude/skills/&lt;name&gt;/SKILL.md</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="guide-section">
          <h4>📚 Documentation Index</h4>
          <p>Access the full Claude Code docs index at: <a href="https://code.claude.com/docs/llms.txt" target="_blank" rel="noopener noreferrer">code.claude.com/docs/llms.txt</a></p>
        </div>
      </>
    )
  },
  {
    slug: "cursor",
    name: "Cursor AI",
    icon: "⚡",
    content: (
      <>
        <h3>Rules, Skills & Subagents</h3>
        <p>Cursor provides a comprehensive system for guiding AI through persistent context, specialized skills, and autonomous subagents.</p>
        
        <div className="guide-section">
          <h4>📜 Project Rules (.mdc)</h4>
          <p>Stored in <code>.cursor/rules</code>, these files define your project conventions using Markdown and YAML frontmatter.</p>
          <ul>
            <li><strong>Always Apply</strong>: Rules included in every chat session.</li>
            <li><strong>Apply Intelligently</strong>: Agent decides relevance based on description.</li>
            <li><strong>Apply to Specific Files</strong>: Scoped via <code>globs</code> patterns.</li>
            <li><strong>Apply Manually</strong>: Explicitly @-mentioned in chat.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🛠️ Agent Skills</h4>
          <p>Portable packages for specialized capabilities. Cursor automatically discovers skills from <code>.cursor/skills/</code> and <code>.agents/skills/</code>.</p>
          <pre className="code-block">
{`.cursor/skills/
└── deploy-app/
    ├── SKILL.md
    └── scripts/`}
          </pre>
        </div>

        <div className="guide-section">
          <h4>👥 Subagents</h4>
          <p>Delegate complex tasks to specialized assistants with their own context window. Cursor includes built-in subagents for Codebase Exploration, Terminal, and Browsing.</p>
          <ul>
            <li><strong>Foreground</strong>: Blocks until completion. Best for sequential tasks.</li>
            <li><strong>Background</strong>: Independent execution. Best for long-running work.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🌍 Team & User Rules</h4>
          <p>Global preferences (User Rules) and organization-wide standards (Team Rules) ensure consistency across all projects.</p>
        </div>
      </>
    )
  },
  {
    slug: "windsurf",
    name: "Windsurf",
    icon: "🌊",
    content: (
      <>
        <h3>Cascade, Memories & Rules</h3>
        <p>Windsurf&apos;s <strong>Cascade</strong> uses a powerful combination of auto-generated memories and user-defined rules to maintain project context.</p>
        
        <div className="guide-section">
          <h4>📜 Rules & AGENTS.md</h4>
          <p>Rules tell Cascade how to behave. You can define them in <code>.windsurf/rules/</code> or use <code>AGENTS.md</code> for directory-scoped instructions.</p>
          <ul>
            <li><strong>Always On</strong>: Rule is included in every message.</li>
            <li><strong>Model Decision</strong>: Cascade reads the rule only when relevant.</li>
            <li><strong>Glob</strong>: Applied when specific files are touched.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🛠️ Skills & Workflows</h4>
          <p>Skills bundle multi-step procedures with resource files, while Workflows are prompt templates for repeatable tasks.</p>
          <pre className="code-block">
{`.windsurf/
├── rules/          # .md files with trigger frontmatter
├── workflows/      # .md files invoked via /slash
└── skills/         # Folders with SKILL.md + resources`}
          </pre>
        </div>

        <div className="guide-section">
          <h4>🧠 Memories</h4>
          <p>Cascade auto-generates memories during conversations. For durable, shared knowledge, prefer <strong>Rules</strong> or <strong>AGENTS.md</strong>.</p>
        </div>

        <div className="guide-section">
          <h4>📊 Comparison: Skills vs Rules vs Workflows</h4>
          <table className="knowledge-table" style={{ width: "100%", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Feature</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Purpose</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Activation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "0.5rem" }}><strong>Skills</strong></td>
                <td style={{ padding: "0.5rem" }}>Multi-step procedures + files</td>
                <td style={{ padding: "0.5rem" }}>Model Decision / @mention</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem" }}><strong>Rules</strong></td>
                <td style={{ padding: "0.5rem" }}>Behavioral guidelines</td>
                <td style={{ padding: "0.5rem" }}>Auto / Glob / Manual</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem" }}><strong>Workflows</strong></td>
                <td style={{ padding: "0.5rem" }}>Repeatable prompt templates</td>
                <td style={{ padding: "0.5rem" }}>Manual via /slash</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="guide-section">
          <h4>🚀 Worktrees</h4>
          <p>Run parallel tasks without interfering with your main workspace. Use <code>post_setup_worktree</code> hooks in <code>.windsurf/hooks.json</code> to sync env files.</p>
        </div>
      </>
    )
  },
  {
    slug: "vscode",
    name: "VS Code Copilot",
    icon: "💙",
    content: (
      <>
        <h3>Customize AI in Visual Studio Code</h3>
        <p>VS Code offers powerful ways to teach the AI about your codebase, coding standards, and workflows using <strong>Copilot Instructions</strong> and <strong>Agent Skills</strong>.</p>
        
        <div className="guide-section">
          <h4>📜 Custom Instructions</h4>
          <p>Define rules that influence how AI generates code. You can use project-wide or file-specific instructions.</p>
          <ul>
            <li><strong>Always-on</strong>: <code>.github/copilot-instructions.md</code> or <code>AGENTS.md</code> applies to every request.</li>
            <li><strong>File-based</strong>: <code>*.instructions.md</code> files conditionally apply based on file type or location using glob patterns.</li>
            <li><strong>Organization-level</strong>: Shared across multiple repositories within a GitHub organization.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>⚡ Prompt Files</h4>
          <p>Create <code>.prompt.md</code> files for repeatable tasks. Invoke them manually in chat using <code>/slash-commands</code>.</p>
          <pre className="code-block">
{`.github/prompts/
└── create-react-form.prompt.md   # Invoke with /create-react-form`}
          </pre>
        </div>

        <div className="guide-section">
          <h4>👤 Custom Agents</h4>
          <p>Define specialized personas (e.g., Security Reviewer, Planner) in <code>.agent.md</code> files. Each agent has its own tools and instructions.</p>
        </div>

        <div className="guide-section">
          <h4>🛠️ Agent Skills</h4>
          <p>Portable capabilities that work across VS Code, Copilot CLI, and cloud agents. Bundled in directories with a <code>SKILL.md</code> file.</p>
          <table className="knowledge-table" style={{ width: "100%", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Scope</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Default Path</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "0.5rem" }}>Project</td>
                <td style={{ padding: "0.5rem" }}><code>.github/skills/&lt;name&gt;/SKILL.md</code></td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem" }}>Personal</td>
                <td style={{ padding: "0.5rem" }}><code>~/.copilot/skills/&lt;name&gt;/SKILL.md</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="guide-section">
          <h4>🔌 MCP Servers</h4>
          <p>Connect external tools and data through the <strong>Model Context Protocol</strong> to give the AI access to databases and APIs.</p>
        </div>
      </>
    )
  },
  {
    slug: "codex",
    name: "Codex",
    icon: "📜",
    content: (
      <>
        <h3>Subagents & Parallel Workflows</h3>
        <p>Codex orchestrates complex tasks by spawning specialized subagents in parallel, each with its own model configuration and instructions.</p>
        
        <div className="guide-section">
          <h4>🤖 Built-in Agents</h4>
          <ul>
            <li><strong>default</strong>: General-purpose fallback agent.</li>
            <li><strong>worker</strong>: Execution-focused for implementation and fixes.</li>
            <li><strong>explorer</strong>: Read-heavy codebase exploration agent.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>👤 Custom Agents (TOML)</h4>
          <p>Define your own agents in <code>.codex/agents/</code>. Each file must specify <code>name</code>, <code>description</code>, and <code>developer_instructions</code>.</p>
          <pre className="code-block">
{`name = "reviewer"
description = "PR reviewer focused on security."
developer_instructions = """
Review code like an owner. Prioritize security.
"""
nickname_candidates = ["Atlas", "Delta"]`}
          </pre>
        </div>

        <div className="guide-section">
          <h4>📊 CSV Batch Processing</h4>
          <p>Use <code>spawn_agents_on_csv</code> to process many similar tasks. Codex reads the CSV, spawns one worker per row, and exports the results.</p>
        </div>

        <div className="guide-section">
          <h4>⚙️ Global Settings</h4>
          <p>Configure orchestration in <code>config.toml</code> under the <code>[agents]</code> section.</p>
          <ul>
            <li><code>max_threads</code>: Concurrent open thread cap (default: 6).</li>
            <li><code>max_depth</code>: Nesting depth for spawned agents (default: 1).</li>
          </ul>
        </div>
      </>
    )
  },
  {
    slug: "trae",
    name: "Trae AI",
    icon: "🎋",
    content: (
      <>
        <h3>Adaptive Rules & Skills</h3>
        <p>Trae AI provides a tiered system of <strong>Rules</strong> and <strong>Skills</strong> to guide the agent without bloating the context window.</p>
        
        <div className="guide-section">
          <h4>📜 User vs Project Rules</h4>
          <ul>
            <li><strong>User Rules</strong>: Take effect in all projects (Global preferences).</li>
            <li><strong>Project Rules</strong>: Specific to the current project, stored in <code>.trae/rules/</code>.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>⚡ Application Modes</h4>
          <p>Control exactly when rules are applied:</p>
          <ul>
            <li><strong>Always Apply</strong>: Effective for all chats in the project.</li>
            <li><strong>Apply to Specific Files</strong>: Triggered by <code>globs</code> patterns.</li>
            <li><strong>Apply Intelligently</strong>: AI decides based on the <code>description</code>.</li>
            <li><strong>Apply Manually</strong>: Use <code>#Rule</code> in chat.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🛠️ Agent Skills</h4>
          <p>Skills are on-demand capabilities packaged in <code>SKILL.md</code>. They only load when invoked, saving tokens.</p>
          <pre className="code-block">
{`.trae/skills/
└── code-review/
    ├── SKILL.md
    └── examples/`}
          </pre>
        </div>

        <div className="guide-section">
          <h4>📁 Convention Directories</h4>
          <p>Trae also supports the standard <code>.agents/skills/</code> directory and <code>AGENTS.md</code> / <code>CLAUDE.md</code> files for cross-IDE compatibility.</p>
        </div>

        <div className="guide-section">
          <h4>📝 Git Commit Rules</h4>
          <p>Enforce standards for AI-generated commit messages by adding <code>scene: git_message</code> to your rule frontmatter.</p>
        </div>
      </>
    )
  },
  {
    slug: "junie",
    name: "Junie",
    icon: "🦊",
    content: (
      <>
        <h3>Skills, Subagents & Guidelines</h3>
        <p>Junie provides task-specific context through a tiered system of Agent Skills and specialized subagents.</p>
        
        <div className="guide-section">
          <h4>🛠️ Agent Skills</h4>
          <p>Folders with instructions and reference materials. Junie only reads a skill's content when it matches the task's needs.</p>
          <ul>
            <li><strong>Project Scope</strong>: <code>.junie/skills/&lt;name&gt;/SKILL.md</code></li>
            <li><strong>User Scope</strong>: <code>~/.junie/skills/&lt;name&gt;/SKILL.md</code></li>
          </ul>
          <pre className="code-block">
{`.junie/skills/api-design/
├── SKILL.md
├── templates/
└── checklists/`}
          </pre>
        </div>

        <div className="guide-section">
          <h4>👥 Custom Subagents</h4>
          <p>Extend Junie's logic with tailored system prompts, tool restrictions, and model overrides.</p>
          <ul>
            <li><strong>Automatic Delegation</strong>: Junie selects subagents by matching their description to the task.</li>
            <li><strong>Tool Restrictions</strong>: Allow or disallow specific tool groups (Read, Bash, Edit, etc.).</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>📜 Guidelines (AGENTS.md)</h4>
          <p>Persistent, reusable project context added to every task. Junie reads from <code>.junie/AGENTS.md</code> or <code>AGENTS.md</code>.</p>
        </div>

        <div className="guide-section">
          <h4>⌨️ Custom Slash Commands</h4>
          <p>Create shortcuts for repetitive prompts using <code>/commands</code>. Supports arguments like <code>Explain the code in $file</code>.</p>
        </div>

        <div className="guide-section">
          <h4>🧠 Custom LLMs</h4>
          <p>Integrate local providers like <strong>Ollama</strong> or enterprise proxies via JSON profiles in <code>.junie/models/</code>.</p>
        </div>
      </>
    )
  },
  {
    slug: "mistral-vibe",
    name: "Mistral AI Vibe",
    icon: "🌪️",
    content: (
      <>
        <h3>Conversational CLI & Skills</h3>
        <p>Vibe is a high-performance command-line coding assistant that provides a conversational interface to your codebase.</p>
        
        <div className="guide-section">
          <h4>🤖 Built-in Agent Profiles</h4>
          <ul>
            <li><strong>default</strong>: Standard agent requiring approval for tool executions.</li>
            <li><strong>plan</strong>: Read-only agent for exploration and planning. Auto-approves safe tools.</li>
            <li><strong>accept-edits</strong>: Auto-approves file edits (write_file, search_replace).</li>
            <li><strong>auto-approve</strong>: Auto-approves all tool executions. Use with caution.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🛠️ Skills & Subagents</h4>
          <p>Extend Vibe using the Agent Skills specification or delegate tasks to specialized subagents.</p>
          <ul>
            <li><strong>Skills</strong>: Add new tools and slash commands via <code>.vibe/skills/</code>.</li>
            <li><strong>Subagents</strong>: Delegate background work using the <code>task</code> tool.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>❓ Interactive Questions</h4>
          <p>The <code>ask_user_question</code> tool allows the agent to ask clarifying questions with pre-defined options, displayed as tabs in the CLI.</p>
        </div>

        <div className="guide-section">
          <h4>🛡️ Safety & Trust</h4>
          <p>Vibe includes a <strong>Trust Folder System</strong> to ensure you only run the agent in directories you trust, preventing accidental execution in sensitive locations.</p>
        </div>

        <div className="guide-section">
          <h4>⚙️ MCP Integration</h4>
          <p>Connect to <strong>Model Context Protocol</strong> servers (stdio or HTTP) to extend Vibe's toolset with custom infrastructure.</p>
        </div>
      </>
    )
  },
  {
    slug: "factory",
    name: "Factory",
    icon: "🏭",
    content: (
      <>
        <h3>Skills, Droids & Commands</h3>
        <p>Factory is an AI-native software development platform for enterprise-grade automation and orchestration.</p>
        
        <div className="guide-section">
          <h4>🧩 Reusable Skills</h4>
          <p>Extend Droid capabilities with outcome-focused modules in <code>.factory/skills/</code>.</p>
          <ul>
            <li><strong>Flexible Invocation</strong>: Skills can be triggered manually via slash commands or automatically by the Droid.</li>
            <li><strong>Token-Efficient</strong>: Lightweight modules that provide specific expertise or workflows without bloat.</li>
            <li><strong>Composable</strong>: Skills can be chained together inside a larger plan.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🤖 Custom Droids (Subagents)</h4>
          <p>Specialized agents with unique system prompts, tool access, and model preferences for task hand-off.</p>
          <ul>
            <li><strong>Context Isolation</strong>: Each subagent runs in a fresh context window to prevent prompt pollution.</li>
            <li><strong>Safety Rules</strong>: Stricter tool categories (read-only, edit, execute) for controlled execution.</li>
            <li><strong>Project-Scoped</strong>: Define droids in <code>.factory/droids/</code> to share with your team.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>⌨️ Custom Slash Commands</h4>
          <p>Turn repeatable prompts into <code>/shortcuts</code> using Markdown templates or executable scripts.</p>
          <ul>
            <li><strong>Markdown Commands</strong>: Seed conversations with checklists or rubrics.</li>
            <li><strong>Executable Commands</strong>: Shell scripts (starting with <code>#!</code>) for environment setup or tests.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🏢 Enterprise Focus</h4>
          <p>Factory is designed for complex codebases, allowing teams to encode conventions, safety rules, and internal playbooks as version-controlled code.</p>
        </div>
      </>
    )
  },
  {
    slug: "ona",
    name: "Ona",
    icon: "🧬",
    content: (
      <>
        <h3>Cloud-based Background Agents</h3>
        <p>Ona is a platform for running autonomous teams of AI engineers in secure, orchestrated cloud environments.</p>
        
        <div className="guide-section">
          <h4>📖 Codebase Context (AGENTS.md)</h4>
          <p>Ona Agent relies on <code>AGENTS.md</code> to understand your project's unique tribal knowledge.</p>
          <ul>
            <li><strong>Tribal Knowledge</strong>: Codify branch naming, test commands, and directory purposes.</li>
            <li><strong>Conciseness</strong>: Aim for under 300 lines to maintain high instruction-following quality.</li>
            <li><strong>Nested Support</strong>: Monorepos can use per-package <code>AGENTS.md</code> files for tailored local context.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🛠️ Agent Skills</h4>
          <p>Teach Ona specific workflows like PR creation, Sentry triage, or Go testing patterns.</p>
          <ul>
            <li><strong>Repository Skills</strong>: Step-by-step procedures in <code>.ona/skills/</code> discovered by description.</li>
            <li><strong>Organization Skills</strong>: Shared best practices accessible across all projects via slash commands.</li>
            <li><strong>Anti-Patterns</strong>: Explicitly define what agents should <em>not</em> do to prevent common mistakes.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🔔 Automation & Webhooks</h4>
          <p>Integrate agents into your CI/CD and monitoring pipelines.</p>
          <ul>
            <li><strong>Completion Triggers</strong>: Instruct agents to run <code>curl</code> notifications upon task finish.</li>
            <li><strong>WatchEvents API</strong>: Monitor agent activity and status programmatically.</li>
          </ul>
        </div>
      </>
    )
  },
  {
    slug: "autohand",
    name: "Autohand",
    icon: "🦾",
    content: (
      <>
        <h3>Adaptive Continuous Engineering</h3>
        <p>Autohand is an autonomous AI software engineer with self-evolving capabilities, designed to achieve Level 5 programming autonomy.</p>
        
        <div className="guide-section">
          <h4>🚀 Autohand Code</h4>
          <p>Self-evolving code agent for terminal-based orchestration, Zed, and VS Code.</p>
          <ul>
            <li><strong>Orchestration</strong>: Manage teams of specialized agents (SRE, Technical Debt, Migration).</li>
            <li><strong>Multi-File Editing</strong>: Ship complete features autonomously across your entire codebase.</li>
            <li><strong>Agentic Search</strong>: Deep, context-aware repository analysis to locate and fix complex bugs.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🧬 Autohand Evolve</h4>
          <p>Deploys self-improving agents that continuously discover and optimize your code using evolutionary algorithms.</p>
          <ul>
            <li><strong>Continuous Evolution</strong>: Agents discover, test, and optimize algorithms autonomously.</li>
            <li><strong>Ground Truth Evaluation</strong>: Validate optimizations against performance criteria and real-world data.</li>
            <li><strong>Cloud-Agnostic</strong>: Run self-evolving agents on AWS, GCP, Azure, or bare metal.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🛠️ Getting Started</h4>
          <p>Install Autohand CLI to bootstrap your autonomous engineering environment.</p>
          <pre style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px", marginTop: "0.5rem" }}>
            <code>curl -fsSL https://autohand.ai/install.sh | sh</code>
          </pre>
          <p style={{ marginTop: "0.5rem" }}>Run <code>autohand init</code> in your venture root to connect your <code>autohand.json</code> config.</p>
        </div>
      </>
    )
  },
  {
    slug: "databricks-genie",
    name: "Databricks Genie",
    icon: "🧱",
    content: (
      <>
        <h3>Data & AI Partner</h3>
        <p>Databricks Genie Code is an autonomous AI partner built for high-performance data engineering and machine learning workflows.</p>
        
        <div className="guide-section">
          <h4>📝 Custom Instructions</h4>
          <p>Personalize Genie Code behavior with hierarchical instruction files.</p>
          <ul>
            <li><strong>Auto-Discovery</strong>: Automatically reads <code>AGENTS.md</code> and <code>CLAUDE.md</code> from your venture root.</li>
            <li><strong>Workspace Standards</strong>: Admins can define <code>.assistant_workspace_instructions.md</code> for team-wide conventions.</li>
            <li><strong>User Context</strong>: Define personal preferences in <code>.assistant_instructions.md</code>.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🧩 Agent Skills</h4>
          <p>Extend Genie Code in Agent mode with specialized domain knowledge using the <strong>Agent Skills</strong> standard.</p>
          <ul>
            <li><strong>Built-in Expertise</strong>: Pre-configured for Unity Catalog, MLflow, and Databricks Notebooks.</li>
            <li><strong>Custom Skills</strong>: Store task-specific workflows, reusable scripts, and documentation in <code>.assistant/skills/</code>.</li>
            <li><strong>Automatic Hand-off</strong>: Genie Code dynamically loads relevant skills based on your request context.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>💡 Best Practices</h4>
          <ul>
            <li><strong>Clear Scope</strong>: Focus skills on single tasks (e.g., "Deploy ML Model") for better recognition.</li>
            <li><strong>Example-Driven</strong>: Include sample inputs/outputs in your skill documentation.</li>
            <li><strong>Conciseness</strong>: Keep instruction files under 20,000 characters for optimal performance.</li>
          </ul>
        </div>
      </>
    )
  },
  {
    slug: "laravel-boost",
    name: "Laravel Boost",
    icon: "🏗️",
    content: (
      <>
        <h3>Laravel Infrastructure</h3>
        <p>Laravel Boost provides a systematic tiered approach to AI context management using global guidelines and on-demand agent skills.</p>
        
        <div className="guide-section">
          <h4>🏗️ Guidelines vs. Skills</h4>
          <p>Optimize your agent&apos;s context window by separating core conventions from task-specific patterns.</p>
          <ul>
            <li><strong>Guidelines</strong>: Foundation context (Laravel standards) loaded upfront in <code>.ai/guidelines/</code>.</li>
            <li><strong>Skills</strong>: On-demand modules for specific packages (Livewire, Pest, Inertia) in <code>.ai/skills/</code>.</li>
            <li><strong>Context Efficiency</strong>: Skills reduce bloat by only loading detailed patterns when relevant to the task.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🧩 Agent Skills</h4>
          <p>Boost supports the <strong>Agent Skills</strong> open standard for portable, actionable capabilities.</p>
          <ul>
            <li><strong>Auto-Installation</strong>: Running <code>boost:install</code> automatically detects and configures skills based on your <code>composer.json</code>.</li>
            <li><strong>Custom Skills</strong>: Create task-specific logic in <code>.ai/skills/domain-logic/SKILL.md</code>.</li>
            <li><strong>Skill Overrides</strong>: Replace built-in Boost skills with your own by matching folder names.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>💻 Workflow</h4>
          <pre style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px", marginTop: "0.5rem" }}>
            <code>php artisan boost:install</code>
          </pre>
          <p style={{ marginTop: "0.5rem" }}>This command bootstraps your <code>.ai/</code> directory with detected package skills and core Laravel guidelines.</p>
        </div>
      </>
    )
  },
  {
    slug: "agent-skills",
    name: "Agent Skills",
    icon: "🔌",
    content: (
      <>
        <h3>The Open Standard for AI Capabilities</h3>
        <p>Agent Skills is a lightweight, open format for extending AI agent capabilities with specialized knowledge and workflows.</p>
        
        <div className="guide-section">
          <h4>💡 What are Skills?</h4>
          <p>A skill is a folder containing a <code>SKILL.md</code> file with metadata (YAML frontmatter) and instructions. Skills can also bundle scripts, templates, and reference materials.</p>
          <pre className="code-block" style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px", marginTop: "0.5rem" }}>
{`my-skill/
├── SKILL.md          # Instructions + metadata
├── scripts/          # Executable code
├── references/       # Documentation
└── assets/           # Templates, resources`}
          </pre>
        </div>

        <div className="guide-section">
          <h4>🔄 Progressive Disclosure</h4>
          <ol>
            <li><strong>Discovery</strong>: Agents load only the name and description at startup (\~100 tokens).</li>
            <li><strong>Activation</strong>: Full instructions are loaded only when the task matches the skill&apos;s description.</li>
            <li><strong>Execution</strong>: The agent follows instructions, loading referenced files or executing code on demand.</li>
          </ol>
        </div>

        <div className="guide-section">
          <h4>📝 The SKILL.md Format</h4>
          <pre className="code-block" style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px", marginTop: "0.5rem" }}>
{`---
name: pdf-processing
description: Extract text, fill forms, merge files. Use when handling PDFs.
---

# PDF Processing
## When to use this skill
Use this skill when the user needs to work with PDF files...`}
          </pre>
        </div>

        <div className="guide-section">
          <h4>✅ Best Practices</h4>
          <ul>
            <li><strong>Ground in Expertise</strong>: Avoid generic advice; include specific API patterns and project conventions.</li>
            <li><strong>Stepwise Guidance</strong>: Concise, stepwise instructions with working examples tend to outperform exhaustive documentation.</li>
            <li><strong>Spend Context Wisely</strong>: Focus on what the agent <em>doesn&apos;t</em> know. Cut generic explanations of standard technologies.</li>
            <li><strong>Prescriptive for Fragility</strong>: Be very specific when operations are fragile (e.g., database migrations).</li>
          </ul>
        </div>
      </>
    )
  },
  {
    slug: "ecosystem",
    name: "Ecosystem Directory",
    icon: "🌐",
    content: (
      <>
        <h3>The AI Coding Landscape</h3>
        <p>A comprehensive directory of modern agentic coding platforms and tools supported by or integrated with Initra.</p>
        
        <div className="guide-section">
          <table className="knowledge-table" style={{ width: "100%", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Platform</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Claude</strong></td><td>Anthropic&apos;s AI for complex reasoning and coding.</td></tr>
              <tr><td><strong>OpenAI Codex</strong></td><td>OpenAI&apos;s legacy and orchestration-focused coding engine.</td></tr>
              <tr><td><strong>Mistral Vibe</strong></td><td>Conversational CLI interface for codebase exploration.</td></tr>
              <tr><td><strong>Trae AI</strong></td><td>Adaptive AI IDE for high-velocity collaboration.</td></tr>
              <tr><td><strong>Ona</strong></td><td>Cloud-based background agents for engineering teams.</td></tr>
              <tr><td><strong>Factory</strong></td><td>AI Droids for enterprise migrations and refactors.</td></tr>
              <tr><td><strong>Autohand CLI</strong></td><td>Autonomous terminal agent using the ReAct pattern.</td></tr>
              <tr><td><strong>Gemini CLI</strong></td><td>Open-source terminal agent powered by Google Gemini.</td></tr>
              <tr><td><strong>Databricks Genie</strong></td><td>Autonomous AI partner for data-specific workflows.</td></tr>
              <tr><td><strong>Laravel Boost</strong></td><td>Best-practice guidelines for AI-assisted Laravel development.</td></tr>
              <tr><td><strong>Cursor</strong></td><td>AI-native code editor and agentic implementation tool.</td></tr>
              <tr><td><strong>Emdash</strong></td><td>Parallel agent execution via git worktrees.</td></tr>
              <tr><td><strong>Amp</strong></td><td>Frontier coding agent wielding high-reasoning models.</td></tr>
              <tr><td><strong>Letta</strong></td><td>Stateful memory platform for self-improving agents.</td></tr>
              <tr><td><strong>Workshop</strong></td><td>Cross-platform hub for multi-agent applications.</td></tr>
              <tr><td><strong>Spring AI</strong></td><td>Streamlined AI integration for Java/Spring environments.</td></tr>
              <tr><td><strong>Piebald</strong></td><td>Control-focused agentic development workspace.</td></tr>
              <tr><td><strong>Agentman</strong></td><td>Healthcare automation via testable AI agents.</td></tr>
              <tr><td><strong>AI Edge Gallery</strong></td><td>Google's hub for mobile on-device LLM execution.</td></tr>
              <tr><td><strong>VS Code</strong></td><td>The industry standard extensible editor for AI integration.</td></tr>
              <tr><td><strong>OpenCode</strong></td><td>Open-source agent for terminal and desktop environments.</td></tr>
              <tr><td><strong>GitHub Copilot</strong></td><td>The standard-bearer for AI pair programming.</td></tr>
              <tr><td><strong>Command Code</strong></td><td>Neuro-symbolic agent that learns individual coding style.</td></tr>
              <tr><td><strong>Goose</strong></td><td>Extensible, open-source agent for full-lifecycle tasks.</td></tr>
              <tr><td><strong>VT Code</strong></td><td>Safety-first agent with robust shell isolation.</td></tr>
              <tr><td><strong>Kiro</strong></td><td>Spec-driven development platform for AI coding.</td></tr>
              <tr><td><strong>Firebender</strong></td><td>Android-native agent with emulator integration.</td></tr>
              <tr><td><strong>Junie</strong></td><td>IntelliJ-based agent with deep semantic understanding.</td></tr>
              <tr><td><strong>Qodo</strong></td><td>Quality-first platform for reviews and integrity.</td></tr>
              <tr><td><strong>Snowflake Cortex</strong></td><td>Snowflake-native agent for data and ML engineering.</td></tr>
              <tr><td><strong>fast-agent</strong></td><td>Developer tool for interaction, evals, and skills.</td></tr>
              <tr><td><strong>nanobot</strong></td><td>Lightweight agent for terminal and messaging platforms.</td></tr>
              <tr><td><strong>Mux</strong></td><td>Isolated workspace runner for parallel browser agents.</td></tr>
              <tr><td><strong>Roo Code</strong></td><td>Project-wide context orchestration in your editor.</td></tr>
              <tr><td><strong>Claude Code</strong></td><td>Agentic terminal tool for reading and editing code.</td></tr>
              <tr><td><strong>pi</strong></td><td>Minimalist terminal harness for custom workflows.</td></tr>
              <tr><td><strong>OpenHands</strong></td><td>Scalable open platform for cloud-native agents.</td></tr>
            </tbody>
          </table>
        </div>
      </>
    )
  }
];

function KnowledgeContent() {
  const searchParams = useSearchParams();
  const [activeIde, setActiveIde] = useState("antigravity");

  useEffect(() => {
    const ide = searchParams.get("ide");
    if (ide && IDE_GUIDES.some(g => g.slug === ide)) {
      setActiveIde(ide);
    }
  }, [searchParams]);

  return (
    <>
      <Navbar />
      
      <div className="knowledge-page" style={{ paddingTop: "8rem", paddingBottom: "6rem", background: "var(--gradient-hero)", minHeight: "100vh" }}>
        <div className="container">
          {/* Hero Section */}
          <div className="knowledge-hero" style={{ textAlign: "center", marginBottom: "5rem" }}>
            <span className="hero-badge">
              <span className="badge-dot"></span>
              The Future of Creation
            </span>
            <h1 style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>
              <span className="gradient-text">Knowledge Center</span>
            </h1>
            <p className="hero-subtitle" style={{ margin: "0 auto", maxWidth: "800px" }}>
              Welcome to the new world of agentic coding. Whether you&apos;re a seasoned architect or a former WordPress designer, 
              Initra and modern AI agents empower you to build world-class infrastructure in minutes.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "3rem" }}>
            {/* Sidebar / Navigation */}
            <aside className="knowledge-sidebar">
              <div className="glass-panel" style={{ padding: "1.5rem", position: "sticky", top: "100px" }}>
                <h4 style={{ marginBottom: "1.5rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                  Setup Guides
                </h4>
                <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {IDE_GUIDES.map(ide => (
                    <button
                      key={ide.slug}
                      onClick={() => setActiveIde(ide.slug)}
                      className={`btn ${activeIde === ide.slug ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ justifyContent: "flex-start", width: "100%" }}
                    >
                      <span style={{ marginRight: "0.75rem" }}>{ide.icon}</span>
                      {ide.name}
                    </button>
                  ))}
                </nav>

                <hr style={{ margin: "2rem 0", borderColor: "var(--border-subtle)" }} />

                <h4 style={{ marginBottom: "1rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                  Education
                </h4>
                <Link href="#layman-guide" className="btn btn-ghost" style={{ justifyContent: "flex-start", width: "100%" }}>
                  💡 Frameworks Explained
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <main className="knowledge-main">
              {/* IDE Guide Section */}
              <section className="glass-panel" style={{ padding: "3rem", marginBottom: "4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
                  <div style={{ fontSize: "3rem", background: "rgba(255,255,255,0.05)", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px", border: "1px solid var(--border-accent)" }}>
                    {IDE_GUIDES.find(i => i.slug === activeIde)?.icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "2rem" }}>{IDE_GUIDES.find(i => i.slug === activeIde)?.name} Setup</h2>
                    <p style={{ color: "var(--text-secondary)" }}>How to use Initra files with your preferred agent.</p>
                  </div>
                </div>
                
                <div className="guide-content">
                  {IDE_GUIDES.find(i => i.slug === activeIde)?.content}
                </div>
              </section>

              {/* Layman Post */}
              <section id="layman-guide" className="glass-panel" style={{ padding: "4rem" }}>
                <div style={{ maxWidth: "700px" }}>
                  <span style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "1rem", display: "block" }}>
                    From Designer to Creator
                  </span>
                  <h2 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>A New World of Creation</h2>
                  
                  <div style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: "1.8" }}>
                    <p style={{ marginBottom: "1.5rem" }}>
                      If you&apos;re coming from a background in WordPress, Wix, or Shopify, terms like &quot;Framework,&quot; &quot;Repository,&quot; and &quot;Next.js&quot; might sound intimidating. 
                      I know, because I was exactly where you are.
                    </p>
                    
                    <p style={{ marginBottom: "1.5rem" }}>
                      I used to be a WordPress website designer. I relied on heavy plugins, paid subscriptions, and limited templates. 
                      I knew very little about &quot;real&quot; coding. But then, the world changed.
                    </p>
 
                    <blockquote style={{ borderLeft: "4px solid var(--accent-primary)", paddingLeft: "2rem", margin: "2.5rem 0", fontStyle: "italic", color: "var(--text-primary)", fontSize: "1.25rem" }}>
                      &quot;I can now spin up Next.js websites with ease&mdash;even easier than WordPress, and they look better, load faster, and I have 100% control.&quot;
                    </blockquote>
 
                    <h3 style={{ color: "var(--text-primary)", marginTop: "3rem", marginBottom: "1rem" }}>What is a Framework?</h3>
                    <p style={{ marginBottom: "1.5rem" }}>
                      Think of a <strong>Framework</strong> (like Next.js or Nuxt) as a high-performance engine and chassis for your car. 
                      Unlike WordPress, which is like a pre-built trailer you can only customize so much, a framework gives you the professional tools to build exactly what you want.
                    </p>
 
                    <p style={{ marginBottom: "1.5rem" }}>
                      With modern AI agents like <strong>Google Antigravity</strong> or <strong>Cursor</strong>, you don&apos;t need to write the engine yourself. 
                      You just need to know how to talk to the mechanics. Initra generates the blueprints (the rules) that tell these AI mechanics exactly how to build your dream.
                    </p>
 
                    <p>
                      No more plugin purchases. No more slow loading times. No more vendor lock-in. 
                      Next.js sites are <strong>faster</strong>, <strong>nicer looking</strong>, and give you <strong>more control</strong> than WordPress ever could.
                      Welcome to the era of the Autonomous Creator.
                    </p>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default function KnowledgeCenter() {
  return (
    <Suspense fallback={<div style={{ paddingTop: "10rem", textAlign: "center", color: "var(--text-muted)" }}>Loading Knowledge Base...</div>}>
      <KnowledgeContent />
      <style jsx global>{`
        .guide-content h3 { margin-top: 2rem; margin-bottom: 1rem; }
        .guide-content h4 { margin-top: 1.5rem; margin-bottom: 0.75rem; color: var(--accent-primary); }
        .guide-content p { color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.6; }
        .guide-content ul, .guide-content ol { margin-left: 1.5rem; margin-bottom: 1.5rem; color: var(--text-secondary); }
        .guide-content li { margin-bottom: 0.5rem; }
        
        .code-block {
          background: rgba(0,0,0,0.3);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-subtle);
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: #a5b4fc;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .guide-section {
          margin-bottom: 2.5rem;
        }

        .knowledge-table {
          border-collapse: collapse;
          font-size: 0.85rem;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .knowledge-table th {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        
        .knowledge-table td {
          border-top: 1px solid var(--border-subtle);
          color: var(--text-secondary);
        }
      `}</style>
    </Suspense>
  );
}
