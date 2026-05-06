---
name: skill-builder
description: Create and manage Initra-compliant Agent Skills with proper progressive disclosure structure (Level 1-3). Use when you need to automate specialized workflows, encapsulate framework expertise, or extend agent capabilities through reusable procedural knowledge.
---

# 🛠️ Skill Builder

This skill provides the framework for creating production-ready Agent Skills within the Initra ecosystem. It ensures all new skills follow the 3-level progressive disclosure standard for maximum token efficiency.

## 📋 Skill Specification

### Level 1: Metadata (Always Loaded)
- **name**: Human-friendly display name (max 64 chars).
- **description**: Precise "what" and "when" clause (max 1024 chars).
- **frontmatter**: MUST start and end with `---`.

### Level 2: SKILL.md Body (Triggered)
- **Overview**: Brief description of the skill's goal.
- **Quick Start**: The 80/20 rule (simplest usage).
- **Procedures**: Detailed step-by-step guidance.
- **Troubleshooting**: Solutions for common failure modes.

### Level 3: Supporting Assets (On-Demand)
- **docs/**: Deep reference material and ADRs.
- **examples/**: Concrete, runnable code patterns.
- **scripts/**: Executable automation for the skill.

---

## 🛠️ Execution Procedures

### Step 1: Scenario Identification
Define the domain of the new skill. 
*Example: `supabase-integration`, `pino-logging-standards`, `nextjs-proxy-management`.*

### Step 2: Directory Scaffolding
Create the top-level structure:
```bash
mkdir -p .agents/skills/[skill-name]/docs
mkdir -p .agents/skills/[skill-name]/examples
mkdir -p .agents/skills/[skill-name]/scripts
```

### Step 3: Drafting SKILL.md
Follow the template provided in `AGENTS.md`. Ensure the description uses high-density trigger words to enable autonomous matching.

---

## 🚦 Validation Checklist
- [ ] Frontmatter contains exactly `name` and `description`.
- [ ] Description front-loads trigger conditions ("Use when...").
- [ ] SKILL.md body uses hierarchical Markdown headers.
- [ ] All file references use relative paths within the skill directory.
- [ ] Skill is registered in the central `AGENTS.md` catalog.

---

## 📖 Reference Links
- [Agent Skills Open Standard](file:///c:/Users/Faiz/Documents/workspaces/initra/AGENTS.md#agent-skills--the-open-standard)
- [Progressive Disclosure Guide](file:///c:/Users/Faiz/Documents/workspaces/initra/AGENTS.md#core-concept-progressive-disclosure)
