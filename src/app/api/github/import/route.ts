import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Octokit } from "octokit";
import { PACKAGE_LIBRARY } from "@/lib/engine/package-library";
import { PROJECT_TEMPLATES } from "@/lib/engine/templates";

export async function POST(req: Request) {
  try {
    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    // Parse owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }
    const [_, owner, repo] = match;

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const cookieStore = await cookies();
    
    // Fallback to the secure cookie if the session doesn't have the provider_token
    const providerToken = session?.provider_token || cookieStore.get("sb-github-token")?.value;
    
    if (!providerToken) {
      return NextResponse.json({ 
        error: "GitHub authentication required. Please log out and sign back in with GitHub." 
      }, { status: 401 });
    }

    const octokit = new Octokit({ auth: providerToken });

    // 1. Fetch root file list to detect framework
    const { data: rootFiles } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: "",
    });

    if (!Array.isArray(rootFiles)) {
      throw new Error("Could not read repository root");
    }

    const fileNames = rootFiles.map((f) => f.name);
    let templateSlug = "";

    if (fileNames.includes("next.config.js") || fileNames.includes("next.config.ts") || fileNames.includes("next.config.mjs")) {
      templateSlug = "nextjs";
    } else if (fileNames.includes("manage.py")) {
      templateSlug = "django";
    } else if (fileNames.includes("nuxt.config.ts") || fileNames.includes("nuxt.config.js")) {
      templateSlug = "nuxt";
    } else if (fileNames.includes("go.mod")) {
      templateSlug = "go-gin";
    }

    if (!templateSlug) {
      return NextResponse.json({ error: "Framework not supported or detected" }, { status: 422 });
    }

    const template = PROJECT_TEMPLATES.find(t => t.slug === templateSlug);
    
    // 2. Scan dependencies if it's a JS/TS project
    let selectedPackages: string[] = [];
    if (fileNames.includes("package.json")) {
      const { data: pkgContent }: any = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: "package.json",
      });
      
      const content = Buffer.from(pkgContent.content, 'base64').toString();
      const pkgJson = JSON.parse(content);
      const allDeps = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) };

      // Map found packages to our library slugs
      selectedPackages = PACKAGE_LIBRARY
        .filter(p => p.npmPackage && allDeps[p.npmPackage])
        .map(p => p.slug);
    }

    return NextResponse.json({
      success: true,
      config: {
        templateSlug,
        templateVersion: template?.availableVersions[0]?.id || "",
        projectName: repo,
        selectedPackages,
        selectedServices: [], // Services are harder to detect from dep list alone
        stackConfig: template?.defaultStack || {},
      }
    });

  } catch (err: any) {
    console.error("GitHub Import Error:", err);
    return NextResponse.json({ error: err.message || "Failed to import repository" }, { status: 500 });
  }
}
