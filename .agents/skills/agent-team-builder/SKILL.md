---
name: agent-team-builder
description: Orchestrate specialized agent teams (Architect, Coder, Tester, Reviewer) using high-fidelity communication protocols. Use when a task requires cross-disciplinary coordination, complex architectural changes, or multi-agent parallel workflows.
---

# 🏗️ Agent Team Builder

This skill provides the procedural knowledge to orchestrate specialized agent teams within the Initra ecosystem. It enables a "Supervisor" agent to delegate tasks, manage handovers, and ensure architectural integrity across multi-agent workflows.

## 📋 Orchestration Checklist

Before starting a multi-agent session, verify the following:
1. [ ] **Role Identification**: Are agent blueprints present? (Check `.claude/agents/`, `.cursor/agents/`, `.codex/agents/`, etc.)
2. [ ] **Topology Selection**: Which pattern fits the task? (Pipeline, Fan-out, or Supervisor)
3. [ ] **Memory Initialization**: Is the session context clear? (Framework, Database, Auth selections)

---

## 🛠️ Orchestration Patterns & Topologies

### 1. Swarm Topologies
- **Mesh (Peer-to-Peer)**: Equal peers. Use for cross-functional collaboration.
- **Hierarchical (Queen-Worker)**: Architect leads specialized workers. Use for large-scale features.
- **Adaptive (Dynamic)**: Swarm switches topology based on task complexity.

### 2. Communication Patterns (Handovers)
- **Pipeline**: `Architect -> Coder -> Tester`.
- **Fan-out**: `Supervisor -> [Agent A, Agent B]`.
- **Supervisor**: `Reviewer <-> Coder`.

---

## 🚦 Execution Procedures (The SPARC Cycle)

Agents MUST follow the SPARC cycle for all handovers:

1. **Specification (S)**: The Supervisor/Architect delivers a precise spec for the sub-task.
2. **Pseudocode (P)**: The receiving agent plans the implementation in natural language.
3. **Architecture (A)**: Verify interface compatibility with other active agents.
4. **Refinement (R)**: Implement with TDD. The Coder writes logic; the Tester writes tests.
5. **Completion (C)**: Reviewer validates. Supervisor merges and captures knowledge.

### Step 1: Topology Discovery
If agent blueprints are missing, invoke the Initra Engine logic:
- Reference: `src/lib/engine/agent-blueprints.ts`
- Command: `generateAgentBlueprints(ideTarget, variables)`

### Step 2: Task Delegation
When delegating to a subagent, provide a **SPARC Brief**:
1. **Objective**: Precise goal of the sub-task.
2. **Context**: Relevant files and landmarks.
3. **Guardrails**: Role-specific "NEVER/ALWAYS" rules from `AGENTS.md`.
4. **Handoff**: Next agent in the pipeline or return to Supervisor.

### Step 3: Handover & Verification
- **Architect to Coder**: Deliver API types and Schema definitions first.
- **Coder to Tester**: Deliver implemented logic and export names.
- **Tester to Reviewer**: Deliver test results and coverage reports.

---

## ⚠️ Anti-Drift Protocols
To prevent "Agent Drift" during long sessions:
- **Periodic Sync**: Every 5 turns, the Supervisor must re-read `AGENTS.md` and the `Venture Blueprint`.
- **Landmark Locking**: Do not allow multiple agents to edit the same landmark simultaneously.
- **Truth Source**: `AGENTS.md` is always the final authority on project conventions.

---

## 📖 Reference Links
- [Initra Architecture](file:///c:/Users/Faiz/Documents/workspaces/initra/README.md)
- [Multi-Agent Recipes](file:///c:/Users/Faiz/Documents/workspaces/initra/AGENTS.md#multi-agent-recipes)
- [Behavioral Rules](file:///c:/Users/Faiz/Documents/workspaces/initra/AGENTS.md#behavioral-rules-always-enforced)
