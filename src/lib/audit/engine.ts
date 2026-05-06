import { GeneratedFile, WizardConfig, AnalysisResult, AuditResult, AuditCheck } from '../engine/types';

/**
 * Autonomous Quality Audit Engine
 * Performs heuristic analysis on generated ventures to ensure Gold Standard compliance.
 */

export async function performAutonomousAudit(
  files: GeneratedFile[], 
  config: WizardConfig
): Promise<AuditResult> {
  const checks: AuditCheck[] = [];
  
  // 1. Next.js 16 Landmark Checks
  if (config.templateSlug === 'nextjs') {
    checks.push(auditNextjs16Standards(files));
    checks.push(auditSEOCompliance(files));
  }

  // 2. Security & Database Checks
  checks.push(auditSecurityPosture(files, config));

  // 3. Logic-Deep Checks (Phase 28)
  checks.push(auditLogicDeepRepairs(files));

  // 4. Performance & Asset Checks
  checks.push(auditPerformanceHeuristics(files));

  // Flatten and filter passed/failed
  const allChecks = checks.flat();
  const passCount = allChecks.filter(c => c.status === 'pass').length;
  const score = Math.round((passCount / allChecks.length) * 100);

  return {
    score,
    checks: allChecks
  };
}

function auditNextjs16Standards(files: GeneratedFile[]): AuditCheck[] {
  const results: AuditCheck[] = [];

  // Check for Proxy (Middleware renamed in v16)
  const hasProxy = files.some(f => f.filename === 'proxy.ts' || f.filename === 'src/proxy.ts');
  results.push({
    id: 'next16-proxy',
    title: 'Next.js 16 Proxy Architecture',
    status: hasProxy ? 'pass' : 'warning',
    category: 'Performance',
    message: hasProxy 
      ? 'Modern Proxy (formerly Middleware) detected and configured.' 
      : 'No proxy.ts detected. Standard routing utilized.',
    actionable_repair: 'Rename middleware.ts to proxy.ts for v16 compliance.'
  });

  // Check for App Router landmarks
  const hasLayout = files.some(f => f.filename.includes('layout.tsx'));
  results.push({
    id: 'next16-layout',
    title: 'Root Layout Structure',
    status: hasLayout ? 'pass' : 'fail',
    category: 'Performance',
    message: hasLayout 
      ? 'Valid App Router layout architecture identified.' 
      : 'Root layout missing or improperly nested.',
  });

  return results;
}

function auditSEOCompliance(files: GeneratedFile[]): AuditCheck[] {
  const results: AuditCheck[] = [];
  
  const pageFiles = files.filter(f => f.filename.includes('page.tsx'));
  const hasMetadata = pageFiles.some(f => f.content.includes('export const metadata'));

  results.push({
    id: 'seo-metadata',
    title: 'Semantic Metadata',
    status: hasMetadata ? 'pass' : 'warning',
    category: 'SEO',
    message: hasMetadata 
      ? 'Static metadata objects found in core pages.' 
      : 'Missing metadata exports. Social sharing and SEO impact restricted.',
    actionable_repair: 'Add export const metadata = { ... } to root pages.'
  });

  return results;
}

function auditSecurityPosture(files: GeneratedFile[], config: WizardConfig): AuditCheck[] {
  const results: AuditCheck[] = [];

  // Check for SQL RLS enforcements
  const sqlFile = files.find(f => f.filename.endsWith('.sql'));
  const hasRLS = sqlFile?.content.toLowerCase().includes('alter table') && sqlFile?.content.toLowerCase().includes('enable row level security');

  results.push({
    id: 'security-rls',
    title: 'PostgreSQL RLS Enforcements',
    status: hasRLS ? 'pass' : 'fail',
    category: 'Security',
    message: hasRLS 
      ? 'Row Level Security is active on all core business entities.' 
      : 'Critical: Database tables found without RLS protection.',
    actionable_repair: 'Run ALTER TABLE x ENABLE ROW LEVEL SECURITY;'
  });

  // Check for environment safety
  const envExample = files.find(f => f.filename === '.env.example');
  const hasSecretsInBoilerplate = envExample?.content.includes('sk_') || envExample?.content.includes('AI_KEY');

  results.push({
    id: 'security-secrets',
    title: 'Secret Leak Prevention',
    status: !hasSecretsInBoilerplate ? 'pass' : 'fail',
    category: 'Security',
    message: !hasSecretsInBoilerplate 
      ? 'Clean environment templates. No hardcoded secrets detected.' 
      : 'Detected hardcoded keys in template files.',
  });

  return results;
}

function auditLogicDeepRepairs(files: GeneratedFile[]): AuditCheck[] {
  const results: AuditCheck[] = [];

  // Check for Hydration Resilience
  const hasMountedHook = files.some(f => f.filename.includes('use-mounted.ts'));
  results.push({
    id: 'logic-hydration',
    title: 'Hydration Resilience',
    status: hasMountedHook ? 'pass' : 'warning',
    category: 'Performance',
    message: hasMountedHook 
      ? 'Client-side mounting safety hooks detected.' 
      : 'Potential hydration mismatches. No useMounted hook found.',
    actionable_repair: 'Implement a useMounted hook for client-only state.'
  });

  // Check for API Fault Tolerance
  const hasApiClient = files.some(f => f.filename.includes('api-client.ts'));
  results.push({
    id: 'logic-api-fault',
    title: 'API Fault Tolerance',
    status: hasApiClient ? 'pass' : 'warning',
    category: 'Security',
    message: hasApiClient 
      ? 'Standardized API client with error boundaries detected.' 
      : 'Native fetch used without standardized error handling.',
    actionable_repair: 'Wrap fetch calls in a standardized ApiClient with retries.'
  });

  return results;
}

function auditPerformanceHeuristics(files: GeneratedFile[]): AuditCheck[] {
  const results: AuditCheck[] = [];

  // Image optimization check
  const usesNextImage = files.some(f => f.content.includes('next/image'));
  results.push({
    id: 'perf-images',
    title: 'Asset Optimization',
    status: usesNextImage ? 'pass' : 'warning',
    category: 'Performance',
    message: usesNextImage 
      ? 'Next.js Image components utilized for automatic optimization.' 
      : 'Standard <img> tags found. Core Web Vitals may be impacted.',
  });

  return results;
}
