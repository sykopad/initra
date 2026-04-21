/**
 * Initra — Segment Analyzer
 * Heuristic engine to identify UI segments in a repository.
 */

import { Octokit } from "octokit";

export interface RepoSegment {
  name: string;
  type: 'navigation' | 'layout' | 'page' | 'style' | 'component';
  filePath: string;
  description: string;
}

export interface AnalysisResult {
  framework: string;
  segments: RepoSegment[];
}

/**
 * Scans a GitHub repository and identifies key UI segments.
 */
export async function analyzeRepository(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<AnalysisResult> {
  // 1. Get entire file tree (limited to first 1000 files for performance)
  const { data: tree } = await octokit.rest.repos.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "true",
  });

  const files = tree.tree.filter((f) => f.type === "blob").map((f) => f.path || "");
  
  // 2. Detect Framework
  let framework = "unknown";
  if (files.includes("next.config.js") || files.includes("next.config.ts") || files.includes("next.config.mjs")) {
    framework = "nextjs";
  } else if (files.includes("nuxt.config.ts") || files.includes("nuxt.config.js")) {
    framework = "nuxt";
  }

  const segments: RepoSegment[] = [];

  if (framework === "nextjs") {
    // 3. Next.js Specific Heuristics
    
    // Find Navigation (Header/Navbar)
    const navFile = files.find(f => 
      f.toLowerCase().includes("navbar") || 
      f.toLowerCase().includes("header") || 
      (f.includes("components/") && f.toLowerCase().includes("nav"))
    );
    if (navFile) {
      segments.push({
        name: "Navigation Header",
        type: "navigation",
        filePath: navFile,
        description: "The main navigation and header component of the application."
      });
    }

    // Find Layout
    const layoutFile = files.find(f => f.includes("app/layout.tsx") || f.includes("pages/_app.tsx"));
    if (layoutFile) {
      segments.push({
        name: "Global Layout",
        type: "layout",
        filePath: layoutFile,
        description: "The core layout structure that wraps all pages."
      });
    }

    // Find Styles
    const styleFile = files.find(f => f.includes("globals.css") || f.includes("theme.css") || f.includes("tailwind.config"));
    if (styleFile) {
      segments.push({
        name: "Design System",
        type: "style",
        filePath: styleFile,
        description: "CSS variables, themes, and global design tokens."
      });
    }

    // Find Pages
    const pages = files.filter(f => 
      (f.startsWith("app/") && f.endsWith("page.tsx")) || 
      (f.startsWith("pages/") && !f.startsWith("pages/_") && (f.endsWith(".tsx") || f.endsWith(".js")))
    );
    
    for (const page of pages.slice(0, 5)) { // Limit to top 5 pages
      const pageName = page === "app/page.tsx" || page === "pages/index.tsx" 
        ? "Home Page" 
        : page.split('/').slice(-2, -1)[0] || "Page";
      
      segments.push({
        name: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page`,
        type: "page",
        filePath: page,
        description: `Main route content for ${pageName}.`
      });
    }
  }

  return {
    framework,
    segments
  };
}
