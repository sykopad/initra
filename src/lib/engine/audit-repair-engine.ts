/**
 * Initra — AI Auto-Repair Engine
 * Converts audit failures into high-fidelity AI repair instructions.
 */

import { AuditCheck } from "./types";

/**
 * Generates a targeted prompt for an AI agent to fix a specific audit failure.
 */
export function generateRepairPrompt(check: AuditCheck, framework: string): string {
  const baseContext = `You are a Principal Software Engineer repairing a ${framework} repository.
The following quality audit check has failed:
Check: ${check.title}
Issue: ${check.message}
Target Fix: ${check.actionable_repair}

TECHNICAL DIRECTIVE:
`;

  switch (check.id) {
    case 'seo-basics':
      return `${baseContext}
1. Create a public/robots.txt file with standard search engine instructions.
2. If Next.js, create a src/app/sitemap.ts (or app/sitemap.ts) file that generates a dynamic sitemap.
3. Ensure these files are correctly linked in the root layout or metadata pipeline.`;

    case 'seo-og':
      if (framework === 'nextjs') {
        return `${baseContext}
1. Update the 'metadata' object in the root layout.tsx file.
2. Add 'openGraph' and 'twitter' fields with high-quality default values (title, description, images).
3. Ensure the metadata is exported as a constant.`;
      }
      return `${baseContext}
1. Locate the main configuration or root layout file.
2. Inject OpenGraph meta tags into the document head or metadata store.`;

    case 'sec-middleware':
      if (framework === 'nextjs') {
        return `${baseContext}
1. Create a middleware.ts file in the root or src directory (following Next.js 16 conventions).
2. Implement a matcher that excludes static assets and public routes.
3. Add a logic block that redirects unauthenticated requests (check for session cookie) to the login page.`;
      }
      return `${baseContext} Implement a global request interceptor or middleware for session protection in ${framework}.`;

    case 'acc-landmarks':
      return `${baseContext}
1. Refactor the root layout or main entry component.
2. Ensure the navigation sidebar is wrapped in <nav>.
3. Ensure the main content area is wrapped in <main>.
4. Ensure the footer area is wrapped in <footer>.`;

    case 'acc-aria':
      return `${baseContext}
1. Scan custom UI components (buttons, links, menus, modals).
2. Add 'aria-label', 'aria-expanded', and 'aria-haspopup' attributes where necessary for keyboard and screen reader accessibility.`;

    case 'perf-lock':
      return `${baseContext} Run the appropriate package manager command (npm install, pnpm install, or yarn install) to generate and commit a deterministic lockfile for the project.`;
    
    case 'logic-hooks':
      return `${baseContext}
1. Analyze existing components for repeated or complex useState/useEffect patterns.
2. Create a 'src/hooks' or 'src/lib/store' directory.
3. Extract logic into a reusable custom hook or a centralized store (e.g. using Zustand or React Context).
4. Update the primary component to consume this new logic layer.`;

    default:
      return `${baseContext} Please analyze the issue and implement the most robust fix following ${framework} best practices.`;
  }
}
