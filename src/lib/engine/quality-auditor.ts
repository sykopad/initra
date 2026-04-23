/**
 * Initra — Quality Auditor
 * Heuristic engine to perform shallow audits for SEO, Security, and Performance.
 */

import { AuditResult, AuditCheck } from "./types";

/**
 * Performs a heuristic quality audit based on the repository file tree.
 */
export async function performQualityAudit(files: string[], framework: string): Promise<AuditResult> {
  const checks: AuditCheck[] = [];
  let score = 100;

  // 1. SEO Audits
  const hasRobots = files.some(f => f.includes("robots.txt"));
  const hasSitemap = files.some(f => f.includes("sitemap.xml") || f.includes("sitemap.ts") || f.includes("sitemap.js"));
  
  if (hasRobots && hasSitemap) {
    checks.push({ id: 'seo-basics', title: 'SEO Foundations', status: 'pass', category: 'SEO', message: 'Search engine discovery files (robots/sitemap) detected.' });
  } else {
    score -= 10;
    checks.push({ 
      id: 'seo-basics', 
      title: 'SEO Foundations', 
      status: 'warning', 
      category: 'SEO', 
      message: 'Missing robots.txt or sitemap.xml. Search engines may have trouble indexing.',
      actionable_repair: 'Create robots.txt and sitemap orchestration files in the root or public directory.'
    });
  }

  const hasOGTags = files.some(f => f.toLowerCase().includes("opengraph") || f.toLowerCase().includes("og-image"));
  if (!hasOGTags && (framework === 'nextjs' || framework === 'nuxt')) {
    score -= 5;
    checks.push({
      id: 'seo-og',
      title: 'Social Preview (OG)',
      status: 'warning',
      category: 'SEO',
      message: 'No OpenGraph metadata detected. Social shares will lack rich previews.',
      actionable_repair: 'Implement OpenGraph metadata (title, description, image) in the root layout or configuration.'
    });
  } else if (hasOGTags) {
    checks.push({ id: 'seo-og', title: 'Social Preview (OG)', status: 'pass', category: 'SEO', message: 'OpenGraph metadata targets detected.' });
  }

  // 2. Security Audits
  const hasMiddleware = files.some(f => f.includes("middleware.ts") || f.includes("middleware.js") || f.includes("_middleware.ts"));
  if (hasMiddleware) {
    checks.push({ id: 'sec-middleware', title: 'Request Shielding', status: 'pass', category: 'Security', message: 'Auth/Security middleware detected.' });
  } else {
    score -= 20;
    checks.push({ 
      id: 'sec-middleware', 
      title: 'Request Shielding', 
      status: 'fail', 
      category: 'Security', 
      message: 'No middleware detected. Ensure routes are protected at the server level.',
      actionable_repair: 'Implement a global middleware or request interceptor to handle authentication and session validation.'
    });
  }

  const envExposed = files.some(f => f === ".env" || f === ".env.local" || f === ".env.production");
  if (envExposed) {
    score -= 30;
    checks.push({ 
      id: 'sec-env', 
      title: 'Secret Exposure', 
      status: 'fail', 
      category: 'Security', 
      message: 'Environment files (.env) detected in repo tree. CRITICAL SECURITY RISK.',
      actionable_repair: 'Remove sensitive .env files from the repository and move them to GitHub Secrets or a secure vault.'
    });
  } else {
    checks.push({ id: 'sec-env', title: 'Secret Exposure', status: 'pass', category: 'Security', message: 'No exposed .env files detected in root.' });
  }

  // 3. Accessibility Audits (Pro)
  const hasLandmarks = files.some(f => f.toLowerCase().includes("nav") || f.toLowerCase().includes("main") || f.toLowerCase().includes("footer"));
  if (hasLandmarks) {
    checks.push({ id: 'acc-landmarks', title: 'Semantic Landmarks', status: 'pass', category: 'Accessibility', message: 'Semantic HTML5 landmarks detected in layout.' });
  } else {
    score -= 10;
    checks.push({
      id: 'acc-landmarks',
      title: 'Semantic Landmarks',
      status: 'warning',
      category: 'Accessibility',
      message: 'Limited use of semantic landmarks (<nav>, <main>, <footer>). Screen readers may struggle.',
      actionable_repair: 'Wrap your application structure in semantic HTML5 landmark tags to improve navigation for assistive technologies.'
    });
  }

  const hasAria = files.some(f => f.includes("aria-") || f.includes("role="));
  if (hasAria) {
    checks.push({ id: 'acc-aria', title: 'ARIA Support', status: 'pass', category: 'Accessibility', message: 'ARIA attributes or roles detected in UI components.' });
  } else {
    score -= 5;
    checks.push({
      id: 'acc-aria',
      title: 'ARIA Support',
      status: 'warning',
      category: 'Accessibility',
      message: 'No ARIA attributes found. Interactive elements might not be accessible.',
      actionable_repair: 'Audit interactive components and add aria-label, aria-expanded, or appropriate role attributes.'
    });
  }

  // 4. Performance Audits
  const hasLockfile = files.some(f => f === "pnpm-lock.yaml" || f === "package-lock.json" || f === "yarn.lock" || f === "bun.lockb");
  if (hasLockfile) {
    checks.push({ id: 'perf-lock', title: 'Dependency Locking', status: 'pass', category: 'Performance', message: 'Deterministic lockfile detected.' });
  } else {
    score -= 10;
    checks.push({ 
      id: 'perf-lock', 
      title: 'Dependency Locking', 
      status: 'warning', 
      category: 'Performance', 
      message: 'No lockfile detected. Builds may be non-deterministic.',
      actionable_repair: 'Generate and commit a lockfile (npm install or pnpm install) to ensure consistent builds across environments.'
    });
  }

  // 5. Logic & State Audits (Deep Repairs)
  const hasComplexHooks = files.some(f => f.includes("hooks/") || f.includes("store/"));
  if (hasComplexHooks) {
    checks.push({ id: 'logic-hooks', title: 'Client State Hygiene', status: 'pass', category: 'Logic', message: 'Structured state management or custom hooks detected.' });
  } else if (framework === 'nextjs' || framework === 'react') {
    score -= 10;
    checks.push({
      id: 'logic-hooks',
      title: 'Client State Hygiene',
      status: 'warning',
      category: 'Logic',
      message: 'No centralized state or custom hooks detected. Interaction logic might be scattered.',
      actionable_repair: 'Refactor complex interaction logic into custom hooks or a lightweight store (Zustand/Context) to improve testability and state hygiene.'
    });
  }

  const hasErrorBoundaries = files.some(f => f.includes("error.tsx") || f.includes("error.js") || f.includes("ErrorBoundary"));
  if (hasErrorBoundaries) {
    checks.push({ id: 'logic-hydration', title: 'Hydration Resilience', status: 'pass', category: 'Logic', message: 'Error boundaries or Next.js error segments detected.' });
  } else if (framework === 'nextjs') {
    score -= 5;
    checks.push({
      id: 'logic-hydration',
      title: 'Hydration Resilience',
      status: 'warning',
      category: 'Logic',
      message: 'No global error boundaries detected. UI might crash on hydration or runtime errors.',
      actionable_repair: 'Implement a global error.tsx (Next.js) or a custom ErrorBoundary component to prevent full-page crashes.'
    });
  }

  const hasAPIWrapper = files.some(f => f.includes("api/client") || f.includes("lib/api") || f.includes("services/"));
  if (hasAPIWrapper) {
    checks.push({ id: 'logic-api', title: 'API Resilience', status: 'pass', category: 'Logic', message: 'Centralized API client or service layer detected.' });
  } else {
    score -= 10;
    checks.push({
      id: 'logic-api',
      title: 'API Resilience',
      status: 'warning',
      category: 'Logic',
      message: 'No centralized API client detected. Error handling and headers might be inconsistent.',
      actionable_repair: 'Create a centralized API client or service layer to handle global error states, token injection, and response normalization.'
    });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return { score, checks };
}
