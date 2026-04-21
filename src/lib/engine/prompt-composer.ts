// =============================================
// Initra — Prompt Composer
// Lightweight template engine with conditionals
// =============================================

import { TemplateVariables } from './types';
import { getTemplate } from './templates';
import { BRAIN_MODULES, FRAMEWORK_ADRS } from './intelligence-overlays';

/** Check if a template variable is considered "empty" / falsy */
function isEmpty(value: string | boolean | string[] | undefined): boolean {
  if (value === undefined || value === null || value === false) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string' && (!value || value === 'none' || value === 'false')) return true;
  return false;
}

/**
 * Interpolates variables into a template string.
 * Supports:
 *   {{variableName}} — simple interpolation
 *   {{#if variableName}}...{{/if}} — conditional blocks
 *   {{#unless variableName}}...{{/unless}} — negative conditional
 */
export function compose(template: string, variables: TemplateVariables): string {
  let result = template;

  // 1. Process {{#unless ...}}...{{/unless}} blocks
  result = result.replace(
    /\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g,
    (_match, varName: string, content: string) => {
      if (isEmpty(variables[varName])) {
        return content.trim();
      }
      return '';
    }
  );

  // 2. Process {{#if ...}}...{{/if}} blocks
  result = result.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_match, varName: string, content: string) => {
      if (!isEmpty(variables[varName])) {
        // Recursively process variable interpolation inside the block
        return interpolateVars(content.trim(), variables);
      }
      return '';
    }
  );

  // 3. Simple variable interpolation
  result = interpolateVars(result, variables);

  // 4. Clean up: remove excessive blank lines (max 2 consecutive)
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

/** Replace {{variableName}} with actual values */
function interpolateVars(text: string, variables: import('./types').TemplateVariables): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_match, varName: string) => {
    const value = variables[varName];
    if (value === undefined || value === null) return '';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  });
}

/**
 * Build the variables map from user wizard config
 */
export function extractVariables(
  templateSlug: string,
  templateVersion: string,
  projectName: string,
  stackConfig: Record<string, string | boolean | string[] | undefined>,
  selectedPackages: string[] = [],
  selectedServices: string[] = [],
  experienceLevel: 'beginner' | 'experienced' = 'experienced',
  orchestrationMode: 'single-agent' | 'multi-agent' = 'single-agent',
  selectedOverlays: string[] = []
): TemplateVariables {
  const vars: TemplateVariables = {
    projectName: projectName || 'My Project',
    experienceLevel,
    orchestrationMode,
    isBeginner: experienceLevel === 'beginner',
    isExpert: experienceLevel === 'experienced',
    isMultiAgent: orchestrationMode === 'multi-agent',
    selectedOverlays,
    templateSlug,
    templateVersion,
    framework: templateSlug,
    language: String(stackConfig.language || 'typescript'),
    styling: String(stackConfig.styling || ''),
    database: String(stackConfig.database || ''),
    auth: String(stackConfig.auth || ''),
    deployment: String(stackConfig.deployment || ''),
    testing: String(stackConfig.testing || ''),
    stateManagement: String(stackConfig.stateManagement || ''),
    packageManager: String(stackConfig.packageManager || 'npm'),
    selectedPackages,
    selectedServices,
    brandColors: stackConfig.brandColors as string[] || [],
  };

  // 1. Synthesize Specialized Instructions from AI Goal
  if (stackConfig.aiGoal) {
    const goal = String(stackConfig.aiGoal);
    vars.aiGoal = goal;
    
    // Simple synthesis: In a real app this might be another LLM call or complex regex
    // For now, we inject the goal as the primary objective.
    vars.projectContextInstructions = `
## Specialized Project Objective
Your primary goal is to implement: "${goal}"

### Priority Directives
- Focus on the core user story described in the objective.
- Ensure all selected packages are integrated specifically to solve this problem.
- Prioritize architectural decisions that support this specific use case.
`;
  }

  // 1. Version Intelligence Flags
  // Next.js logic
  if (templateSlug === 'nextjs') {
    vars.isNext16 = templateVersion.startsWith('16');
    vars.isNext15 = templateVersion.startsWith('15');
    vars.isNext14 = templateVersion.startsWith('14');
  }
  // Django logic
  if (templateSlug === 'django') {
    vars.isDjango6 = templateVersion.startsWith('6');
    vars.isDjango5 = templateVersion.startsWith('5');
  }
  // Nuxt logic
  if (templateSlug === 'nuxt') {
    vars.isNuxt3 = templateVersion.startsWith('3');
  }

  // Copy all stack config values
  for (const [key, value] of Object.entries(stackConfig)) {
    if (!(key in vars)) {
      vars[key] = value;
    }
  }

  // Derive computed variables
  vars.devCommand = deriveDevCommand(templateSlug, vars.packageManager as string);
  vars.buildCommand = deriveBuildCommand(templateSlug, vars.packageManager as string);
  vars.testCommand = deriveTestCommand(vars.testing as string, vars.packageManager as string);
  vars.installCommand = deriveInstallCommand(vars.packageManager as string);
  vars.dbPushCommand = deriveDbPushCommand(vars.database as string);
  vars.languageLabel = 
    vars.language === 'typescript' ? 'TypeScript' : 
    vars.language === 'python' ? 'Python' : 
    vars.language === 'dart' ? 'Dart' : 
    vars.language === 'go' ? 'Go' :
    vars.language === 'rust' ? 'Rust' :
    vars.language as string;

  if (template?.agentInstructions) {
    vars.agentInstructions = interpolateVars(template.agentInstructions, vars);
  }

  // 3. Synthesize Agent Intelligence (Phase 18)
  let intelligenceBlock = '';
  
  // Add Framework ADR
  const frameworkADR = FRAMEWORK_ADRS[templateSlug];
  if (frameworkADR) {
    intelligenceBlock += frameworkADR + '\n';
  }

  // Add Selected Overlays
  for (const overlaySlug of selectedOverlays) {
    const module = BRAIN_MODULES[overlaySlug];
    if (module) {
      intelligenceBlock += module.instructions + '\n';
    }
  }

  // Add Experience-level refinements
  if (experienceLevel === 'beginner') {
    intelligenceBlock += `
## Educational Directives (Beginner Mode)
- **Explain Why**: For every major architectural change, add a brief comment explaining the rationale.
- **Reference Docs**: Provide links to official documentation for any new libraries introduced.
- **Verbose Comments**: Use meaningful JSDoc for functions to help the user understand the data flow.
`;
  }

  vars.agentIntelligence = intelligenceBlock.trim();

  return vars;
}

function deriveDevCommand(template: string, pm: string): string {
  const run = pm === 'npm' ? 'npm run' : pm;
  switch (template) {
    case 'nextjs': return `${run} dev`;
    case 'nuxt': return `${run} dev`;
    case 'django': return 'python manage.py runserver';
    case 'react-native': return 'npx expo start';
    case 'fastapi': return 'uvicorn main:app --reload';
    case 'flutter': return 'flutter run';
    case 'express': return `${run} dev`;
    case 'python-ml': return 'python main.py';
    default: return `${run} dev`;
  }
}

function deriveBuildCommand(template: string, pm: string): string {
  const run = pm === 'npm' ? 'npm run' : pm;
  switch (template) {
    case 'nextjs': return `${run} build`;
    case 'nuxt': return `${run} build`;
    case 'django': return 'python manage.py collectstatic --noinput';
    case 'flutter': return 'flutter build apk';
    case 'fastapi': return 'docker build -t app .';
    case 'express': return `${run} build`;
    default: return `${run} build`;
  }
}

function deriveTestCommand(testing: string, pm: string): string {
  if (!testing || testing === 'none') return '';
  const run = pm === 'npm' ? 'npm run' : pm;
  switch (testing) {
    case 'pytest': return 'pytest';
    case 'vitest': return `${run} test`;
    case 'jest': return `${run} test`;
    case 'flutter-test': return 'flutter test';
    default: return `${run} test`;
  }
}

function deriveInstallCommand(pm: string): string {
  switch (pm) {
    case 'pnpm': return 'pnpm install';
    case 'yarn': return 'yarn';
    case 'bun': return 'bun install';
    default: return 'npm install';
  }
}

function deriveDbPushCommand(db: string): string {
  switch (db) {
    case 'supabase': return 'npx supabase db push';
    case 'prisma-postgres': return 'npx prisma db push';
    case 'drizzle-postgres': return 'npx drizzle-kit push';
    default: return '';
  }
}
