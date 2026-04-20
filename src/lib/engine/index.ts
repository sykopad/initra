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
    config.selectedServices ?? []
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

  // 6. Return the complete result
  return {
    files,
    templateUsed: template.slug,
    generatedAt: new Date().toISOString(),
    config,
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
