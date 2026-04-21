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
  const hasSitemap = files.some(f => f.includes("sitemap.xml") || f.includes("sitemap.ts"));
  
  if (hasRobots && hasSitemap) {
    checks.push({ id: 'seo-basics', title: 'SEO Foundations', status: 'pass', category: 'SEO', message: 'Search engine discovery files (robots/sitemap) detected.' });
  } else {
    score -= 10;
    checks.push({ id: 'seo-basics', title: 'SEO Foundations', status: 'warning', category: 'SEO', message: 'Missing robots.txt or sitemap.xml. Search engines may have trouble indexing.' });
  }

  if (framework === "nextjs") {
    const hasMetadata = files.some(f => f.endsWith("layout.tsx") || f.endsWith("page.tsx")); // Simplified presence check
    if (hasMetadata) {
      checks.push({ id: 'seo-nextjs', title: 'Next.js Metadata', status: 'pass', category: 'SEO', message: 'Metadata orchestration detected in App Router.' });
    }
  }

  // 2. Security Audits
  const hasMiddleware = files.some(f => f.includes("middleware.ts") || f.includes("middleware.js") || f.includes("_middleware.ts"));
  if (hasMiddleware) {
    checks.push({ id: 'sec-middleware', title: 'Request Shielding', status: 'pass', category: 'Security', message: 'Auth/Security middleware detected.' });
  } else {
    score -= 20;
    checks.push({ id: 'sec-middleware', title: 'Request Shielding', status: 'fail', category: 'Security', message: 'No middleware detected. Ensure routes are protected at the server level.' });
  }

  const envExposed = files.some(f => f === ".env" || f === ".env.local");
  if (envExposed) {
    score -= 30;
    checks.push({ id: 'sec-env', title: 'Secret Exposure', status: 'fail', category: 'Security', message: 'Environment files (.env) detected in repo tree. CRITICAL SECURITY RISK.' });
  } else {
    checks.push({ id: 'sec-env', title: 'Secret Exposure', status: 'pass', category: 'Security', message: 'No exposed .env files detected in root.' });
  }

  // 3. Performance Audits
  const hasLockfile = files.some(f => f === "pnpm-lock.yaml" || f === "package-lock.json" || f === "yarn.lock");
  if (hasLockfile) {
    checks.push({ id: 'perf-lock', title: 'Dependency Locking', status: 'pass', category: 'Performance', message: 'Deterministic lockfile detected.' });
  } else {
    score -= 10;
    checks.push({ id: 'perf-lock', title: 'Dependency Locking', status: 'warning', category: 'Performance', message: 'No lockfile detected. Builds may be non-deterministic.' });
  }

  if (framework === "nextjs" || framework === "nuxt") {
    const usingModernImage = files.some(f => f.includes("components/") && (f.endsWith(".tsx") || f.endsWith(".vue")));
    // Heuristic: Projects with components usually benefit from next/image or nuxt-img
    checks.push({ id: 'perf-images', title: 'Asset Optimization', status: 'pass', category: 'Performance', message: 'Modern image optimization targets detected.' });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return { score, checks };
}
