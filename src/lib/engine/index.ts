// =============================================
// Initra — Prompt Generation Engine
// Main entry point
// =============================================

import { WizardConfig, GenerationResult, GeneratedFile, IDETarget } from './types';
import { extractVariables } from './prompt-composer';
import { formatForIDE } from './ide-formatter';
import { getTemplate } from './templates';

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
    config.projectName,
    config.stackConfig,
    config.selectedPackages ?? []
  );

  // 3. Generate files for each selected IDE
  const files: GeneratedFile[] = [];
  for (const ide of config.selectedIDEs) {
    const ideFiles = formatForIDE(ide as IDETarget, variables, '');
    files.push(...ideFiles);
  }

  // 4. Return the complete result
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
