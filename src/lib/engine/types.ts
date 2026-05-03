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
  | 'trae'
  | 'aider'
  | 'devin'
  | 'replit'
  | 'universal'
  | 'antigravity'
  | 'codex'
  | 'junie'
  | 'mistral-vibe'
  | 'factory'
  | 'ona'
  | 'autohand'
  | 'databricks-genie'
  | 'laravel-boost';

/** Package/library categories */
export type PackageCategory =
  | 'data-fetching'
  | 'forms-validation'
  | 'ui-components'
  | 'animation'
  | 'auth'
  | 'payments'
  | 'email'
  | 'file-upload'
  | 'monitoring'
  | 'charts'
  | 'realtime'
  | 'background-jobs'
  | 'other';

/** Knowledge block for a package/library */
export interface PackageKnowledge {
  installCommand?: string;
  setupSnippet?: string;
  usageSnippet?: string;
  antiPatterns?: string[];
  conventions?: string[];
}

/** A package/library in the registry */
export interface PackageDefinition {
  slug: string;
  name: string;
  category: PackageCategory;
  icon: string;
  description: string;
  /** Language this package belongs to (e.g. 'typescript', 'python', 'go') */
  language: string;
  /** npm package name for display badge */
  npmPackage?: string;
  /** PyPI package name for display badge */
  pyPackage?: string;
  /** pub.dev package name for display badge */
  pubPackage?: string;
  /** go package path for display badge */
  goPackage?: string;
  /** Which template slugs this package is compatible with */
  compatibleTemplates: string[];
  /** Optional: templates explicitly excluded */
  excludedTemplates?: string[];
  knowledge: PackageKnowledge;
  /** Official documentation or setup guides */
  documentationUrls?: string[];
  boilerplateFiles?: BoilerplateFile[];
}

/** Environment variable definition */
export interface EnvVar {
  key: string;
  description: string;
  required: boolean;
  placeholder?: string;
}

/** An external API/Service definition */
export interface ApiService {
  slug: string;
  name: string;
  registrationUrl: string;
  description: string;
  envVars: EnvVar[];
  category: 'llm' | 'auth' | 'database' | 'payments' | 'email' | 'monitoring' | 'analytics' | 'infrastructure' | 'saas' | 'cms' | 'search' | 'automation' | 'storage' | 'notifications' | 'other';
  icon: string;
  /** Official documentation for the API */
  documentationUrl?: string;
  /** Compatibility guards */
  compatibility?: {
    languages?: string[];
    frameworks?: string[];
    exclude?: string[];
  };
  boilerplateFiles?: BoilerplateFile[];
}

/** Package category metadata for UI display */
export interface PackageCategoryMeta {
  slug: PackageCategory;
  label: string;
  icon: string;
}

/** Precise framework versioning */
export interface FrameworkVersion {
  id: string;
  label: string;
  status: 'stable' | 'legacy' | 'canary';
  major: number;
}

/** Project template definition */
export interface ProjectTemplate {
  slug: string;
  name: string;
  category: ProjectCategory;
  icon: string;
  description: string;
  /** Primary language: 'typescript', 'python', 'dart', 'go', 'rust', 'java' */
  language: string;
  availableVersions: FrameworkVersion[];
  defaultStack: Record<string, string | boolean | string[] | undefined>;
  stackOptions: StackOption[];
  boilerplateFiles?: BoilerplateFile[];
  /** Optional: specialized instructions for the IDE agent for this template */
  agentInstructions?: string;
  /** Optional: specialized design guidelines for this template */
  designPreset?: string;
  /** Optional: recommended design preset for this template */
  recommendedDesignPreset?: string;
}

/** Design Preset definition */
export interface DesignPreset {
  slug: string;
  name: string;
  description: string;
  colors?: Record<string, string>;
  typography?: Record<string, any>;
  components?: Record<string, any>;
  content: string; // The full markdown content
}

/** Dynamic form field for stack configuration */
export interface StackOption {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'select' | 'multi-select' | 'toggle' | 'text';
  options?: { value: string; label: string }[];
  defaultValue: string | boolean | string[];
  isRequired: boolean;
  section: 'core' | 'advanced';
  description?: string;
}

/** User's selections from the wizard */
export interface WizardConfig {
  templateSlug: string;
  templateVersion: string;
  projectName: string;
  stackConfig: Record<string, string | boolean | string[] | undefined>;
  selectedIDEs: IDETarget[];
  selectedPackages: string[];
  selectedServices: string[];
  includeBoilerplate?: boolean;
  experienceLevel?: 'beginner' | 'experienced';
  orchestrationMode?: 'single-agent' | 'multi-agent';
  selectedBrains?: string[];
  selectedWorkflows?: string[];
  selectedOverlays?: string[]; // Deprecated, keep for compatibility
  ventureType?: 'ai-generated' | 'user-suggested';
  agentInstructions?: string;
  // Layman / Branding fields
  projectTypeSlug?: string;
  brandColors?: string[];
  logoUrl?: string;
  modelSlug?: string;
  includeTests?: boolean;
  webhookUrl?: string;
  isPrivate?: boolean;
  designPreset?: string;
}

/** Boilerplate file definition */
export interface BoilerplateFile {
  path: string;
  content: string;
  targetTemplate?: string;
  /** Optional: only include if this condition matches stack config value */
  condition?: {
    field: string;
    value: string | boolean;
  };
  /** Optional: if true, this file will be merged into an existing one instead of overwriting */
  mergeType?: 'package-json' | 'append' | 'prepend' | 'inject';
  /** For 'inject', where to put the content (regex or marker string) */
  injectMarker?: string;
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
  selectedPackages: string[];
  selectedServices: string[];
  selectedBrains?: string[];
  selectedWorkflows?: string[];
  designPreset?: string;
  designGuidelines?: string;
  designTokensCss?: string;

  [key: string]: string | boolean | string[] | undefined;
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
  condition?: string;
  content: string;
}

/** Specialized workflow logic blocks */
export interface WorkflowOverlay {
  slug: string;
  name: string;
  description: string;
  icon: string;
  content: string;
  /** Optional: only allow for these templates */
  compatibleTemplates?: string[];
}

/** Repository segment identified by heuristics */
export interface RepoSegment {
  id?: string;
  name: string;
  type: 'navigation' | 'layout' | 'page' | 'style' | 'component' | 'logic' | 'config';
  landmarkType?: 'hero' | 'footer' | 'sidebar' | 'feed' | 'form' | 'unknown';
  domain?: string;
  filePath: string;
  description: string;
  confidence: number;
  isLogic?: boolean;
}

/** Result of repository analysis */
export interface AnalysisResult {
  framework: string;
  segments: RepoSegment[];
  audit?: AuditResult;
}

/** Quality Audit Result */
export interface AuditResult {
  score: number; // 0-100
  checks: AuditCheck[];
}

/** Single Audit Check */
export interface AuditCheck {
  id: string;
  title: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  category: 'SEO' | 'Security' | 'Performance' | 'Accessibility';
  actionable_repair?: string;
}
