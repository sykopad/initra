# Hatch Venture Workflow

**Command: /hatch-venture**

Guide the user through the process of finalizing and deploying a "Venture" (generated project) to their GitHub infrastructure.

## Steps

1. **Blueprint Validation**: 
   - Verify that all required fields in the `WizardConfig` are present.
   - Run `generateAgentFiles` internally to check for template resolution errors.

2. **Quality Audit**:
   - Use the `quality-auditor.ts` logic to score the generated configuration.
   - Report any warnings or failures to the user.

3. **File Preview**:
   - List the files that will be generated (e.g., `AGENTS.md`, `.env.example`, boilerplate).
   - Ask the user for any final adjustments to the `agentInstructions`.

4. **GitHub Synchronization**:
   - Check if the user has a GitHub token configured (usually in `.env.local`).
   - Create a new repository using the user's account.
   - Commit and push the generated files.

5. **Finalization**:
   - Provide links to the new repository and the Vercel deployment (if applicable).
   - Success message: "Venture successfully hatched! 🚀"
