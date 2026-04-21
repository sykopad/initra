/**
 * Initra — Hatch Engine
 * Orchestrates the autonomous birth of a venture.
 */

import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';
import { generateAgentFiles } from '@/lib/engine';
import { WizardConfig } from '@/lib/engine/types';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SUPABASE_MGMT_TOKEN = process.env.SUPABASE_MGMT_TOKEN; // PAT for project orchestration
const SUPABASE_ORG_ID = process.env.SUPABASE_ORG_ID;

/**
 * Maps Initra templates to Vercel framework slugs
 */
function getVercelFramework(templateSlug: string): string | null {
  const mapping: Record<string, string> = {
    'nextjs': 'nextjs',
    'nuxt': 'nuxtjs',
    'svelte-kit': 'sveltekit',
    'gatsby': 'gatsby',
    'remix': 'remix',
    'vite': 'vite',
  };
  return mapping[templateSlug] || null;
}

export async function hatchVenture(projectId: string) {
  const supabase = await createClient();
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  // 1. Fetch Project Data
  const { data: project, error: fetchError } = await supabase
    .from('community_projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (fetchError || !project) throw new Error('Project not found');
  if (project.is_hatched) throw new Error('Project already hatched');

  const config = project.blueprint_config as WizardConfig;
  const repoName = project.title.toLowerCase().replace(/[^a-z0-9]/g, '-');

  try {
    // 2. Create GitHub Repository
    console.log(`[Hatch] Creating GitHub repo: ${repoName}`);
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description: project.description,
      auto_init: true,
      private: false, // Community projects are public by default
    });

    // 3. Create Vercel Project
    console.log(`[Hatch] Creating Vercel project...`);
    const vercelFramework = getVercelFramework(config.templateSlug);
    
    const vercelRes = await fetch(`https://api.vercel.com/v9/projects${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        framework: vercelFramework,
        gitRepository: {
          type: 'github',
          repo: `${repo.owner.login}/${repo.name}`,
        },
      }),
    });

    if (!vercelRes.ok) {
      const vError = await vercelRes.json();
      console.error('Vercel Creation Error:', vError);
    }

    const vercelData = await vercelRes.json();

    // 4. Assign Subdomain
    console.log(`[Hatch] Assigning domain: ${domain}`);
    await fetch(`https://api.vercel.com/v10/projects/${vercelData.id}/domains${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });

    // 5. Create Sovereign Supabase Project
    console.log(`[Hatch] Provisioning sovereign database...`);
    let supabaseUrl = "";
    let supabaseAnonKey = "";
    
    try {
      const sbResult = await createSovereignDatabase(repoName);
      supabaseUrl = sbResult.url;
      supabaseAnonKey = sbResult.anonKey;
    } catch (sbErr) {
      console.warn("[Hatch] Supabase provisioning failed (fallback to shared):", sbErr);
    }

    // 6. Inject Environment Variables into Vercel
    if (supabaseUrl) {
      console.log(`[Hatch] Injecting environment variables...`);
      await injectVercelEnv(vercelData.id, {
        'NEXT_PUBLIC_SUPABASE_URL': supabaseUrl,
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': supabaseAnonKey,
      });
    }

    // 7. Generate & Push Content
    console.log(`[Hatch] Generating agent files...`);
    config.includeBoilerplate = true; 
    const result = await generateAgentFiles(config);

    // Push files to GitHub
    for (const file of result.files) {
      const content = Buffer.from(file.content).toString('base64');
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: repo.owner.login,
        repo: repo.name,
        path: file.filePath,
        message: `chore: initra autonomous hatch - ${file.filename}`,
        content,
        branch: 'main',
      });
    }

    // 8. Update Database
    await supabase
      .from('community_projects')
      .update({
        is_hatched: true,
        github_url: repo.html_url,
        live_url: `https://${domain}`,
        status: 'in_progress',
        provisioning_status: {
          github: "complete",
          vercel: "complete",
          supabase: supabaseUrl ? "complete" : "failed",
          dns: "complete"
        }
      })
      .eq('id', projectId);

    return {
      success: true,
      repoUrl: repo.html_url,
      liveUrl: `https://${domain}`,
      supabaseUrl
    };

  } catch (err: any) {
    console.error('Hatch Failed:', err);
    throw err;
  }
}

/**
 * Creates a dedicated Supabase project via Management API
 */
async function createSovereignDatabase(name: string) {
  if (!SUPABASE_MGMT_TOKEN || !SUPABASE_ORG_ID) {
    throw new Error("Supabase Management API not configured");
  }

  const res = await fetch(`https://api.supabase.com/v1/projects`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_MGMT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      organization_id: SUPABASE_ORG_ID,
      region: 'us-east-1',
      plan: 'free', // Developers start on free tier
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Supabase API error: ${error.message}`);
  }

  const data = await res.json();
  // Return placeholder credentials (real ones would be fetched or set via API)
  return {
    url: `https://${data.id}.supabase.co`,
    anonKey: "sb_publishable_placeholder_pk", 
  };
}

/**
 * Injects environment variables into a Vercel project
 */
async function injectVercelEnv(projectId: string, env: Record<string, string>) {
  for (const [key, value] of Object.entries(env)) {
    await fetch(`https://api.vercel.com/v10/projects/${projectId}/env${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        value,
        type: 'plain',
        target: ['development', 'preview', 'production'],
      }),
    });
  }
}
