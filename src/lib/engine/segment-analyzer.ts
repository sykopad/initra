/**
 * Initra — Segment Analyzer (Deep Heuristics v2)
 * Heuristic engine to identify UI landmarks and feature domains in a repository.
 */

import { Octokit } from "octokit";
import { RepoSegment, AnalysisResult } from "./types";
import { performQualityAudit } from "./quality-auditor";

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
  const { data: tree } = await octokit.rest.git.getTree({
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
  } else if (files.includes("manage.py") || files.some(f => f.includes("settings.py"))) {
    framework = "django";
  } else if (files.includes("go.mod") || files.includes("main.go")) {
    framework = "go";
  } else if (files.includes("pubspec.yaml") || files.includes("lib/main.dart")) {
    framework = "flutter";
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
        let logicName = "Backend Logic";
        if (lowerFile.includes("actions")) {
          logicName = `Action: ${formatComponentName(file)}`;
        } else if (file.includes("api/")) {
          const route = file.split('api/')[1].replace('/route.ts', '').replace('/route.js', '');
          logicName = `API: /${route}`;
        }

        segments.push({
          name: logicName,
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
      
      // A. Layouts, Entry & Config
      if (file.endsWith("layout.vue") || file === "app.vue" || file.includes("layouts/")) {
        segments.push({
          name: file === "app.vue" ? "Main Entrance" : formatComponentName(file),
          type: "layout",
          domain: detectDomain(file),
          filePath: file,
          description: "Structural layout wrapper or application entry point.",
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

      // C. Logic (Nitro API, Composables, Plugins, Middleware)
      else if (
        (file.startsWith("server/") && (file.endsWith(".ts") || file.endsWith(".js"))) ||
        (file.includes("composables/") && (file.endsWith(".ts") || file.endsWith(".js") || file.endsWith(".vue"))) ||
        (file.includes("plugins/") && (file.endsWith(".ts") || file.endsWith(".js"))) ||
        (file.includes("middleware/") && (file.endsWith(".ts") || file.endsWith(".js"))) ||
        (file.includes("utils/") && (file.endsWith(".ts") || file.endsWith(".js")))
      ) {
        let logicType = "Nitro API Endpoint";
        let desc = "Server-side business logic and data orchestration.";
        
        if (file.includes("composables/")) {
          logicType = "Vue Composable";
          desc = "Reusable stateful logic built with Vue Composition API.";
        } else if (file.includes("plugins/")) {
          logicType = "Nuxt Plugin";
          desc = "Application-level plugin for Nuxt lifecycle and global context.";
        } else if (file.includes("middleware/")) {
          logicType = file.startsWith("server/") ? "Server Middleware" : "Route Middleware";
          desc = "Logic executed before route entry or request handling.";
        } else if (file.includes("utils/")) {
          logicType = "Utility Function";
          desc = "Pure helper functions and shared logic.";
        }

        let semanticName = logicType;
        if (logicType === "Nitro API Endpoint") {
          const route = file.split('server/api/')[1]?.replace('.ts', '').replace('.js', '') || formatComponentName(file);
          semanticName = `Nitro: /${route}`;
        } else {
          semanticName = `${logicType}: ${formatComponentName(file)}`;
        }

        segments.push({
          name: semanticName,
          type: "logic",
          isLogic: true,
          domain: detectDomain(file),
          filePath: file,
          description: desc,
          confidence: 0.95
        });
      }

      // D. State Management (Pinia Stores)
      else if ((file.includes("stores/") || file.includes("store/")) && (file.endsWith(".ts") || file.endsWith(".js"))) {
        segments.push({
          name: `${formatComponentName(file)} Store`,
          type: "logic",
          isLogic: true,
          domain: detectDomain(file),
          filePath: file,
          description: "Pinia global state management and persistent store.",
          confidence: 0.95
        });
      }

      // E. UI Components & Landmarks
      else if (file.includes("components/") && (file.endsWith(".vue") || file.endsWith(".ts") || file.endsWith(".js"))) {
        const landmark = detectLandmark(file);
        if (landmark !== 'unknown' || file.includes("base/") || file.includes("shared/") || file.includes("ui/")) {
          segments.push({
            name: formatComponentName(file),
            type: "component",
            landmarkType: landmark,
            domain: detectDomain(file),
            filePath: file,
            description: `Identified ${landmark !== 'unknown' ? landmark : 'UI'} Vue component.`,
            confidence: landmark !== 'unknown' ? 0.9 : 0.7
          });
        }
      }

      // F. Config & Styling
      else if (lowerFile.includes("nuxt.config") || lowerFile.includes("app.config") || lowerFile.includes("tailwind.config") || lowerFile.includes("assets/css")) {
        segments.push({
          name: lowerFile.includes("nuxt.config") ? "Nuxt Config" : (lowerFile.includes("app.config") ? "App Config" : "Global Styles"),
          type: "config",
          domain: "Design System",
          filePath: file,
          description: "Framework configuration and global design tokens.",
          confidence: 1.0
        });
      }
    }
  } else if (framework === "django") {
    // 3. Deep Heuristics for Django 6 (MVT)
    
    for (const file of files) {
      const lowerFile = file.toLowerCase();
      
      // A. Models, Views, URLs (Logic)
      if (file.endsWith("models.py") || file.endsWith("views.py") || file.endsWith("urls.py") || file.endsWith("admin.py") || file.endsWith("forms.py")) {
        let logicType = "Backend Logic";
        if (file.endsWith("models.py")) logicType = "Data Model";
        if (file.endsWith("views.py")) logicType = "View Logic";
        if (file.endsWith("urls.py")) logicType = "URL Router";
        
        segments.push({
          name: logicType,
          type: "logic",
          isLogic: true,
          domain: detectDomain(file),
          filePath: file,
          description: "Python business logic and data definitions.",
          confidence: 1.0
        });
      }

      // B. Templates (UI)
      else if (file.includes("templates/") && file.endsWith(".html")) {
        const isLayout = lowerFile.includes("base.html") || lowerFile.includes("layout.html");
        const landmark = detectLandmark(file);
        
        segments.push({
          name: formatComponentName(file),
          type: isLayout ? "layout" : (landmark !== 'unknown' ? "component" : "page"),
          landmarkType: landmark,
          domain: detectDomain(file),
          filePath: file,
          description: isLayout ? "Global structural template." : "HTML representation template.",
          confidence: isLayout ? 1.0 : 0.8
        });
      }

      // C. Settings & Config
      else if (file.endsWith("settings.py") || file.endsWith("apps.py")) {
        segments.push({
          name: file.endsWith("settings.py") ? "Django Settings" : "App Config",
          type: "config",
          domain: "General Configuration",
          filePath: file,
          description: "Global framework and app-level settings.",
          confidence: 1.0
        });
      }
    }
  } else if (framework === "go") {
    // 3. Deep Heuristics for Go (Gin/Axum)
    
    for (const file of files) {
      const lowerFile = file.toLowerCase();
      
      // A. Handlers, Controllers, Routes (Logic)
      if (
        file.endsWith("_handler.go") || 
        file.endsWith("_controller.go") || 
        file.includes("handlers/") || 
        file.includes("controllers/") || 
        file.includes("routes.go") || 
        file.includes("router.go") ||
        file === "main.go"
      ) {
        let logicType = "Backend Logic";
        if (file.includes("handler") || file.includes("controller")) logicType = "API Handler";
        if (file.includes("router") || file.includes("routes")) logicType = "URL Router";
        if (file === "main.go") logicType = "Entry Logic";

        segments.push({
          name: logicType,
          type: "logic",
          isLogic: true,
          domain: detectDomain(file),
          filePath: file,
          description: "High-performance Go business logic and request handling.",
          confidence: 1.0
        });
      }

      // B. Models (Data Logic)
      else if (file.endsWith("_model.go") || file.includes("models/")) {
        segments.push({
          name: "Data Model",
          type: "logic",
          isLogic: true,
          domain: detectDomain(file),
          filePath: file,
          description: "Go struct definitions and database orchestration.",
          confidence: 0.9
        });
      }

      // C. Templates (UI)
      else if (file.endsWith(".gohtml") || file.endsWith(".tmpl") || (file.includes("templates/") && file.endsWith(".html"))) {
        const isLayout = lowerFile.includes("base") || lowerFile.includes("layout");
        const landmark = detectLandmark(file);
        
        segments.push({
          name: formatComponentName(file),
          type: isLayout ? "layout" : (landmark !== 'unknown' ? "component" : "page"),
          landmarkType: landmark,
          domain: detectDomain(file),
          filePath: file,
          description: isLayout ? "Global Go-template layout." : "Go-template UI fragment.",
          confidence: isLayout ? 1.0 : 0.8
        });
      }
    }
  } else if (framework === "flutter") {
    // 3. Deep Heuristics for Flutter 4 (Dart)
    
    for (const file of files) {
      if (!file.startsWith("lib/")) continue; // Focus on source code
      
      const lowerFile = file.toLowerCase();
      
      // A. Screens & Pages
      if (file.includes("pages/") || file.includes("screens/") || file.endsWith("_screen.dart") || file.endsWith("_page.dart")) {
        const pageName = file.split('/').pop()?.split('.')[0] || "Page";
        segments.push({
          name: formatComponentName(file),
          type: "page",
          domain: detectDomain(file),
          filePath: file,
          description: "Mobile screen/page widget representation.",
          confidence: 1.0
        });
      }

      // B. State Management & Models (Logic)
      else if (
        file.includes("models/") || 
        file.includes("providers/") || 
        file.includes("bloc/") || 
        file.includes("riverpod/") || 
        file.includes("services/") ||
        file.endsWith("_service.dart") ||
        file.endsWith("_model.dart") ||
        file === "lib/main.dart"
      ) {
        let logicType = "Business Logic";
        if (file.includes("model")) logicType = "Data Model";
        if (file.includes("provider") || file.includes("bloc") || file.includes("riverpod")) logicType = "State Logic";
        if (file === "lib/main.dart") logicType = "App Entrance";
        
        segments.push({
          name: logicType,
          type: "logic",
          isLogic: true,
          domain: detectDomain(file),
          filePath: file,
          description: "Dart business logic and state orchestration.",
          confidence: 1.0
        });
      }

      // C. Widgets & Components
      else if (file.includes("widgets/") || file.includes("components/")) {
        const landmark = detectLandmark(file);
        segments.push({
          name: formatComponentName(file),
          type: "component",
          landmarkType: landmark,
          domain: detectDomain(file),
          filePath: file,
          description: `Flutter ${landmark !== 'unknown' ? landmark : 'UI'} widget.`,
          confidence: landmark !== 'unknown' ? 0.8 : 0.6
        });
      }
    }
  }

  // Final filtering: Sort by confidence and domain
  const finalSegments = segments
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 25); // Limit for performance/UI

  // 4. Perform Quality Audit
  const audit = await performQualityAudit(files, framework);

  return { framework, segments: finalSegments, audit };
}

/** Helper: Capatlize strings */
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function detectDomain(path: string): string {
  const p = path.toLowerCase();
  if (p.includes("auth") || p.includes("account") || p.includes("user") || p.includes("login") || p.includes("signup")) return "Auth & Security";
  if (p.includes("billing") || p.includes("subscription") || p.includes("pricing") || p.includes("payment")) return "Billing";
  if (p.includes("dashboard") || p.includes("admin") || p.includes("panel")) return "Dashboard";
  if (p.includes("settings") || p.includes("profile") || p.includes("preferences")) return "Account Settings";
  if (p.includes("api/") || p.includes("views/") || p.includes("logic/")) return "Backend Logic";
  if (p.includes("marketing") || p.includes("landing") || p.includes("promo")) return "Marketing";
  return "Core Application";
}

/** Helper: Detect Landmark Type */
function detectLandmark(path: string): RepoSegment['landmarkType'] {
  const p = path.toLowerCase();
  // Support for both React (.tsx) and Vue (.vue) nomenclature
  if (p.includes("hero") || p.includes("banner") || p.includes("cta") || p.includes("landing")) return "hero";
  if (p.includes("footer") || p.includes("copyright") || p.includes("bottom") || p.includes("appbar")) return "footer";
  if (p.includes("sidebar") || p.includes("navrail") || p.includes("aside") || p.includes("drawer")) return "sidebar";
  if (p.includes("form") || p.includes("input") || p.includes("login") || p.includes("signup") || p.includes("auth") || p.includes("fab")) return "form";
  if (p.includes("feed") || p.includes("list") || p.includes("grid") || p.includes("collection") || p.includes("sliver")) return "feed";
  return "unknown";
}

/** Helper: Format file path into a human-readable component name */
function formatComponentName(path: string): string {
  const base = path.split('/').pop()?.split('.')[0] || "Component";
  return base.split(/[-_]/).map(capitalize).join(" ");
}
