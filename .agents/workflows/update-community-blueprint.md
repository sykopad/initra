# Update Community Blueprint Workflow

**Command: /update-blueprint**

Process community-suggested blueprints and promote them to the official Initra registry.

## Steps

1. **Fetch Suggestion**:
   - Query the `community_projects` table in Supabase.
   - Filter for projects with high `vote_score`.

2. **Analysis**:
   - Analyze the suggested stack and goal.
   - Map it to an existing `ProjectCategory`.

3. **Draft Definition**:
   - Generate a `ProjectTemplate` draft in `src/lib/engine/templates.ts`.
   - Propose a set of `stackOptions` based on the suggestion.

4. **Review & Merge**:
   - Present the draft to the user for approval.
   - Upon approval, append the new template to the registry.
   - Update `layman-projects.ts` if a new project type is warranted.

5. **Acknowledgement**:
   - Mark the community suggestion as "Implemented" in the database.
   - (Optional) Trigger a notification to the contributor.
