/**
 * Initra — Segment Analyzer (Deep Heuristics v2)
 * Heuristic engine to identify UI landmarks and feature domains in a repository.
 */

import { Octokit } from "octokit";
import { RepoSegment, AnalysisResult } from "./types";

/**
 * Scans a GitHub repository and identifies key UI segments.
 */
export async function analyzeRepository(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<AnalysisResult> {
  // 1. Get entire file tree
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
    // 3. Deep Heuristics for Next.js
    
    for (const file of files) {
      const lowerFile = file.toLowerCase();
      
      // A. Layouts & Metadata
      if (file.endsWith("layout.tsx") || file.endsWith("layout.js")) {
        segments.push({
          name: file.includes("app/") ? "Global Layout" : "Nested Layout",
          type: "layout",
          domain: detectDomain(file),
          filePath: file,
          description: "Structural layout wrapper for this feature area.",
          confidence: 1.0
        });
      }

      // B. Pages
      else if (file.endsWith("page.tsx") || file.endsWith("page.js")) {
        const pageName = file === "app/page.tsx" ? "Home" : file.split('/').slice(-2, -1)[0] || "Page";
        segments.push({
          name: `${capitalize(pageName)} Page`,
          type: "page",
          domain: detectDomain(file),
          filePath: file,
          description: `Main route content for ${pageName}.`,
          confidence: 1.0
        });
      }

      // C. Logic (API Routes & Server Actions)
      else if (file.endsWith("route.ts") || file.endsWith("route.js") || lowerFile.includes("actions.ts") || lowerFile.includes("actions.js")) {
        segments.push({
          name: lowerFile.includes("actions") ? "Server Actions" : "API Endpoint",
          type: "logic",
          isLogic: true,
          domain: detectDomain(file),
          filePath: file,
          description: "Backend business logic and data orchestration.",
          confidence: 0.9
        });
      }

      // D. UI Components & Landmarks
      else if (file.includes("components/") && (file.endsWith(".tsx") || file.endsWith(".jsx"))) {
        const landmark = detectLandmark(file);
        if (landmark !== 'unknown' || file.includes("ui/")) {
          segments.push({
            name: formatComponentName(file),
            type: "component",
            landmarkType: landmark,
            domain: detectDomain(file),
            filePath: file,
            description: `Identified ${landmark !== 'unknown' ? landmark : 'UI'} component.`,
            confidence: landmark !== 'unknown' ? 0.8 : 0.6
          });
        }
      }

      // E. Config & Styles
      else if (lowerFile.includes("globals.css") || lowerFile.includes("tailwind.config") || lowerFile.includes("theme.ts")) {
        segments.push({
          name: lowerFile.includes("tailwind") ? "Tailwind Config" : "Global Styles",
          type: "style",
          domain: "Design System",
          filePath: file,
          description: "Global design tokens and styling configurations.",
          confidence: 1.0
        });
      }
    }
  } else if (framework === "nuxt") {
    // 3. Deep Heuristics for Nuxt 4
    
    for (const file of files) {
      const lowerFile = file.toLowerCase();
      
      // A. Layouts & Entry
      if (file.endsWith("layout.vue") || file === "app.vue") {
        segments.push({
          name: file === "app.vue" ? "Main Entrance" : "Global Layout",
          type: "layout",
          domain: detectDomain(file),
          filePath: file,
          description: "Structural layout wrapper for this Nuxt feature area.",
          confidence: 1.0
        });
      }

      // B. Pages
      else if (file.includes("pages/") && file.endsWith(".vue")) {
        const pageName = file.split('/').pop()?.split('.')[0] || "Page";
        segments.push({
          name: `${capitalize(pageName)} Page`,
          type: "page",
          domain: detectDomain(file),
          filePath: file,
          description: `Main route content for ${pageName}.`,
          confidence: 1.0
        });
      }

      // C. Logic (Nitro API & Middleware)
      else if (file.startsWith("server/") && (file.endsWith(".ts") || file.endsWith(".js"))) {
        segments.push({
          name: file.includes("middleware") ? "Server Middleware" : "Nitro API Endpoint",
          type: "logic",
          isLogic: true,
          domain: detectDomain(file),
          filePath: file,
          description: "Backend Nitro business logic and API orchestration.",
          confidence: 0.9
        });
      }

      // D. UI Components & Landmarks
      else if (file.includes("components/") && file.endsWith(".vue")) {
        const landmark = detectLandmark(file);
        if (landmark !== 'unknown' || file.includes("base/") || file.includes("shared/")) {
          segments.push({
            name: formatComponentName(file),
            type: "component",
            landmarkType: landmark,
            domain: detectDomain(file),
            filePath: file,
            description: `Identified ${landmark !== 'unknown' ? landmark : 'UI'} Vue component.`,
            confidence: landmark !== 'unknown' ? 0.8 : 0.6
          });
        }
      }

      // E. Config & Assets
      else if (lowerFile.includes("assets/css") || lowerFile.includes("nuxt.config") || lowerFile.includes("tailwind.config")) {
        segments.push({
          name: lowerFile.includes("config") ? "Nuxt Config" : "Global Styles",
          type: "style",
          domain: "Design System",
          filePath: file,
          description: "Framework configuration and global design tokens.",
          confidence: 1.0
        });
      }
    }
  }

  // Final filtering: Sort by confidence and domain
  const finalSegments = segments
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 25); // Limit for performance/UI

  return { framework, segments: finalSegments };
}

/** Helper: Capatlize strings */
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Helper: Detect Feature Domain */
function detectDomain(path: string): string {
  const p = path.toLowerCase();
  if (p.includes("auth")) return "Auth & Security";
  if (p.includes("billing") || p.includes("subscription") || p.includes("pricing")) return "Billing";
  if (p.includes("dashboard") || p.includes("admin")) return "Dashboard";
  if (p.includes("settings") || p.includes("profile")) return "Account Settings";
  if (p.includes("api/")) return "Backend Logic";
  if (p.includes("marketing") || p.includes("landing")) return "Marketing";
  return "Core Application";
}

/** Helper: Detect Landmark Type */
function detectLandmark(path: string): RepoSegment['landmarkType'] {
  const p = path.toLowerCase();
  // Support for both React (.tsx) and Vue (.vue) nomenclature
  if (p.includes("hero") || p.includes("banner") || p.includes("cta") || p.includes("landing")) return "hero";
  if (p.includes("footer") || p.includes("copyright") || p.includes("bottom")) return "footer";
  if (p.includes("sidebar") || p.includes("navrail") || p.includes("aside") || p.includes("drawer")) return "sidebar";
  if (p.includes("form") || p.includes("input") || p.includes("login") || p.includes("signup") || p.includes("auth")) return "form";
  if (p.includes("feed") || p.includes("list") || p.includes("grid") || p.includes("collection")) return "feed";
  return "unknown";
}

/** Helper: Format file path into a human-readable component name */
function formatComponentName(path: string): string {
  const base = path.split('/').pop()?.split('.')[0] || "Component";
  return base.split(/[-_]/).map(capitalize).join(" ");
}
