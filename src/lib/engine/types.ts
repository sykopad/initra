// =============================================
// Initra — Prompt Generation Engine Types
// =============================================

/** Supported project categories */
export type ProjectCategory =
  | 'web-app'
  | 'mobile-app'
  | 'api-backend'
  | 'ai-ml'
  | 'game-dev'
  | 'library-package'
  | 'infrastructure'
  | 'extension-plugin';

/** Supported IDE targets */
export type IDETarget =
  | 'claude-code'
  | 'cursor'
  | 'windsurf'
  | 'gemini'
  | 'copilot'
  | 'universal';

/** Project template definition */
export interface ProjectTemplate {
  slug: string;
  name: string;
  category: ProjectCategory;
  icon: string;
  description: string;
  defaultStack: Record<string, string>;
  stackOptions: StackOption[];
}

/** Dynamic form field for stack configuration */
export interface StackOption {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'select' | 'multi-select' | 'toggle' | 'text';
  options?: { value: string; label: string }[];
  defaultValue: string | boolean;
  isRequired: boolean;
  section: 'core' | 'advanced';
  description?: string;
}

/** User's selections from the wizard */
export interface WizardConfig {
  templateSlug: string;
  projectName: string;
  stackConfig: Record<string, string | boolean>;
  selectedIDEs: IDETarget[];
}

/** Single generated file output */
export interface GeneratedFile {
  ideTarget: IDETarget;
  filename: string;
  filePath: string;
  content: string;
}

/** Complete generation result */
export interface GenerationResult {
  files: GeneratedFile[];
  templateUsed: string;
  generatedAt: string;
  config: WizardConfig;
}

/** Internal template variable mapping */
export interface TemplateVariables {
  projectName: string;
  framework: string;
  language: string;
  styling: string;
  database: string;
  auth: string;
  deployment: string;
  testing: string;
  stateManagement: string;
  packageManager: string;
  [key: string]: string | boolean | undefined;
}

/** IDE target configuration */
export interface IDETargetConfig {
  slug: IDETarget;
  name: string;
  icon: string;
  configFilename: string;
  configPath: string;
  description: string;
  supportsMultiFile: boolean;
}

/** Prompt template stored in DB (or hardcoded) */
export interface PromptTemplate {
  ideSlug: IDETarget;
  projectCategory: ProjectCategory;
  templateBody: string;
  sections: TemplateSection[];
}

/** Template section with conditional rendering */
export interface TemplateSection {
  name: string;
  condition?: string; // e.g., "database" — renders only if variable is truthy
  content: string;
}
