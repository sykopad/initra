// =============================================
// Initra — Prompt Generation Engine
// Main entry point
// =============================================

import { WizardConfig, GenerationResult, GeneratedFile, IDETarget } from './types';
import { extractVariables } from './prompt-composer';
import { formatForIDE } from './ide-formatter';
import { getTemplate } from './templates';
import { getServiceDefinition } from './service-library';
import { generateProjectBoilerplate } from './boilerplate-engine';

/**
 * Main engine function: generates agent configuration files
 * based on the user's wizard selections.
 * 
 * This is a pure, deterministic function — no LLM calls.
 * All templates are handcrafted for quality and speed.
 */
export function generateAgentFiles(config: WizardConfig): GenerationResult {
  // 1. Resolve the template
  const template = getTemplate(config.templateSlug);
  if (!template) {
    throw new Error(`Unknown template: ${config.templateSlug}`);
  }

  // 2. Extract and map variables from wizard config
  const variables = extractVariables(
    config.templateSlug,
    config.templateVersion,
    config.projectName,
    config.stackConfig,
    config.selectedPackages ?? [],
    config.selectedServices ?? [],
    config.experienceLevel ?? 'experienced',
    config.orchestrationMode ?? 'single-agent',
    config.selectedOverlays ?? []
  );

  // 3. Generate files for each selected IDE
  const files: GeneratedFile[] = [];
  for (const ide of config.selectedIDEs) {
    const ideFiles = formatForIDE(ide as IDETarget, variables, '');
    files.push(...ideFiles);
  }

  // 4. Generate .env.example file
  const envFile = generateEnvExample(config.selectedServices ?? []);
  if (envFile) {
    files.push(envFile);
  }

  // 5. Generate Project Boilerplate (if enabled)
  const boilerplateFiles = generateProjectBoilerplate(config);
  files.push(...boilerplateFiles);

  // 6. Inject Autonomous Agent Workflow (if it's an AI-generated venture)
  if (config.ventureType === 'ai-generated') {
    const agentWorkflow = generateAutonomousWorkflow(config);
    if (agentWorkflow) files.push(agentWorkflow);
  }

  // 7. Inject CI Workflow (Hatching 3.0)
  if (config.includeTests || config.stackConfig.testing !== 'none') {
    const ciWorkflow = generateCIWorkflow(config);
    if (ciWorkflow) files.push(ciWorkflow);
  }

  // 8. Return the complete result
  return {
    files,
    templateUsed: template.slug,
    generatedAt: new Date().toISOString(),
    config,
  };
}

/**
 * Generates a GitHub Action workflow for autonomous agent builds
 */
function generateAutonomousWorkflow(config: WizardConfig): GeneratedFile | null {
  const content = `name: 🤖 Autonomous Agent Build
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  agent-build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Aider
        run: |
          python -m pip install aider-chat
          
      - name: Run Agent Work Order
        env:
          OPENROUTER_API_KEY: \${{ secrets.OPENROUTER_API_KEY }}
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          echo "Processing work order..."
          # In a real scenario, we would parse the Work Order from the commit message or an AGENTS.md supplement
          # For now, we apply the high-level instructions
          aider --message "Initialize the core features as defined in AGENTS.md" --auto-test --yes
`;

  return {
    ideTarget: 'universal',
    filename: 'initra-agent.yml',
    filePath: '.github/workflows/initra-agent.yml',
    content,
  };
}

/**
 * Generate a ZIP-compatible file structure
 * Returns an object mapping file paths to content
 */
export function generateFileMap(config: WizardConfig): Record<string, string> {
  const result = generateAgentFiles(config);
  const fileMap: Record<string, string> = {};
  for (const file of result.files) {
    fileMap[file.filePath] = file.content;
  }
  return fileMap;
}

/**
 * Generates a .env.example file content based on selected services
 */
function generateEnvExample(selectedServices: string[]): GeneratedFile | null {
  if (!selectedServices.length) return null;

  let content = '# =============================================\n';
  content += '# Initra — Generated .env.example\n';
  content += '# Copy this file to .env.local and fill in your keys\n';
  content += '# =============================================\n\n';

  for (const slug of selectedServices) {
    const service = getServiceDefinition(slug);
    if (!service) continue;

    content += `# ── ${service.name} ─────────────────────────────\n`;
    content += `# ${service.description}\n`;
    content += `# Register at: ${service.registrationUrl}\n`;
    
    for (const env of service.envVars) {
      if (env.description) content += `# ${env.description}\n`;
      content += `${env.key}=${env.placeholder || ''}\n`;
    }
    content += '\n';
  }

  return {
    ideTarget: 'universal',
    filename: '.env.example',
    filePath: '.env.example',
    content,
  };
}

/**
 * Generates a GitHub Action workflow for CI/CD and Testing
 */
function generateCIWorkflow(config: WizardConfig): GeneratedFile | null {
  const testing = config.stackConfig.testing;
  
  let steps = `
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm install
`;

  if (testing === 'vitest' || testing === 'jest') {
    steps += `
      - name: Run Unit Tests
        run: npm run test
`;
  }

  if (testing === 'playwright') {
    steps += `
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E Tests
        run: npx playwright test
        env:
          NEXT_PUBLIC_SUPABASE_URL: \${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: \${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
`;
  }

  const content = `name: 🧪 Unit & E2E Testing
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:${steps}
`;

  return {
    ideTarget: 'universal',
    filename: 'initra-ci.yml',
    filePath: '.github/workflows/initra-ci.yml',
    content,
  };
}
