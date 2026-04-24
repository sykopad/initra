"use server";

/**
 * Initra — Hatch Engine
 * Orchestrates the autonomous birth of a venture.
 */

import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';
import { generateAgentFiles } from '@/lib/engine';
import { WizardConfig } from '@/lib/engine/types';

import { callOpenRouter } from '@/lib/ai/openrouter';
import { injectRepoSecret, injectEnvSecret } from '@/lib/utils/github-secrets';
import { applyInitialSchema } from '@/lib/db/db-server';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SUPABASE_MGMT_TOKEN = process.env.SUPABASE_MGMT_TOKEN;
const SUPABASE_ORG_ID = process.env.SUPABASE_ORG_ID;
const MASTER_VENTURE_PASSWORD = process.env.MASTER_VENTURE_PASSWORD || 'Initra_Default_2026!'; // Fallback logic

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

export async function hatchVenture(projectId: string, userGithubToken?: string) {
  const supabase = await createClient();

  // 1. Fetch Project Data
  const { data: project, error: fetchError } = await supabase
    .from('community_projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (fetchError || !project) throw new Error('Project not found');
  if (project.is_hatched) throw new Error('Project already hatched');

  // Fetch user profile for sovereign tokens
  const { data: profile } = await supabase
    .from('profiles')
    .select('vercel_token, vercel_team_id, github_personal_token')
    .eq('id', project.user_id)
    .single();

  const VERCEL_TOKEN_TO_USE = profile?.vercel_token || process.env.VERCEL_TOKEN;
  const VERCEL_TEAM_ID_TO_USE = profile?.vercel_team_id || process.env.VERCEL_TEAM_ID;
  const GITHUB_TOKEN_TO_USE = profile?.github_personal_token || userGithubToken || GITHUB_TOKEN;

  const octokit = new Octokit({ auth: GITHUB_TOKEN_TO_USE });

  const config = project.blueprint_config as WizardConfig;
  const repoName = project.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const isPrivate = config.isPrivate ?? false;

  try {
    // 2. Create GitHub Repository
    console.log(`[Hatch] Creating GitHub repo: ${repoName}`);
    await updateProvisioningStatus(projectId, { github: 'processing' });
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description: project.description,
      auto_init: true,
      private: isPrivate,
    });
    await updateProvisioningStatus(projectId, { github: 'complete' });

    // 3. Create Vercel Project
    console.log(`[Hatch] Creating Vercel project...`);
    await updateProvisioningStatus(projectId, { vercel: 'processing' });
    const vercelFramework = getVercelFramework(config.templateSlug);
    
    const vercelRes = await fetch(`https://api.vercel.com/v9/projects${VERCEL_TEAM_ID_TO_USE ? `?teamId=${VERCEL_TEAM_ID_TO_USE}` : ''}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN_TO_USE}`,
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
      await updateProvisioningStatus(projectId, { vercel: 'failed' });
      throw new Error(`Vercel creation failed: ${vError.message}`);
    }

    const vercelData = await vercelRes.json();
    await updateProvisioningStatus(projectId, { vercel: 'complete' });

    // 4. Assign Subdomain
    const domain = `${repoName}.initra.ai`; // Standardize
    console.log(`[Hatch] Assigning domain: ${domain}`);
    await updateProvisioningStatus(projectId, { dns: 'processing' });
    await fetch(`https://api.vercel.com/v10/projects/${vercelData.id}/domains${VERCEL_TEAM_ID_TO_USE ? `?teamId=${VERCEL_TEAM_ID_TO_USE}` : ''}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN_TO_USE}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });
    await updateProvisioningStatus(projectId, { dns: 'complete' });

    // 5. Create Sovereign Supabase Project
    console.log(`[Hatch] Provisioning sovereign database...`);
    await updateProvisioningStatus(projectId, { supabase: 'processing' });
    let supabaseUrl = "";
    let supabaseAnonKey = "";
    let dbId = "";
    
    try {
      const sbResult = await createSovereignDatabase(repoName, MASTER_VENTURE_PASSWORD);
      supabaseUrl = sbResult.url;
      supabaseAnonKey = sbResult.anonKey;
      dbId = sbResult.id;

      // 5.1 AI SQL Architect: Generate Schema
      console.log(`[Hatch] Generating initial schema...`);
      const schemaSql = await generateInitialSchema(config, project.description);

      // 5.2 PG Migration Runner: Apply Schema
      console.log(`[Hatch] Injecting migrations into database...`);
      await applyInitialSchema(dbId, schemaSql, MASTER_VENTURE_PASSWORD);
      
      await updateProvisioningStatus(projectId, { supabase: 'complete' });
    } catch (sbErr) {
      console.warn("[Hatch] Database orchestration failed:", sbErr);
      await updateProvisioningStatus(projectId, { supabase: 'failed' });
    }

    // 6. Inject Environment Variables into Vercel
    if (supabaseUrl) {
      console.log(`[Hatch] Injecting environment variables...`);
      await injectVercelEnv(vercelData.id, {
        'NEXT_PUBLIC_SUPABASE_URL': supabaseUrl,
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': supabaseAnonKey,
      }, VERCEL_TOKEN_TO_USE, VERCEL_TEAM_ID_TO_USE);

      // 6.1 Inject GitHub Secrets
      console.log(`[Hatch] Provisioning GitHub Secrets for CI...`);
      try {
        await createGitHubEnvironment(octokit, repo.owner.login, repo.name, 'Production');
        await injectEnvSecret(octokit, repo.owner.login, repo.name, 'Production', 'NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);
        await injectEnvSecret(octokit, repo.owner.login, repo.name, 'Production', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey);
        await injectRepoSecret(octokit, repo.owner.login, repo.name, 'NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);
        await injectRepoSecret(octokit, repo.owner.login, repo.name, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey);
      } catch (secErr) {
        console.warn("[Hatch] Failed to inject GitHub secrets:", secErr);
      }
    }

    // 7. Generate & Push Content
    console.log(`[Hatch] Generating agent files...`);
    config.includeBoilerplate = true; 
    config.includeTests = true; 
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
        sha: undefined // New repo
      });
    }

    // 7.1 Branch Protection
    console.log(`[Hatch] Enforcing branch protection for 'main'...`);
    try {
      await setBranchProtection(octokit, repo.owner.login, repo.name, 'main', 'test'); 
    } catch (bpErr) {
      console.warn("[Hatch] Failed to set branch protection:", bpErr);
    }

    // 8. Update Database Completion
    await supabase
      .from('community_projects')
      .update({
        is_hatched: true,
        github_url: repo.html_url,
        live_url: `https://${domain}`,
        status: 'in_progress',
      })
      .eq('id', projectId);

    // 9. Trigger Webhook (if provided)
    if (config.webhookUrl) {
      console.log(`[Hatch] Triggering Webhook: ${config.webhookUrl}`);
      try {
        await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'venture_hatched',
            project_id: projectId,
            repo_url: repo.html_url,
            live_url: `https://${domain}`,
            supabase_url: supabaseUrl,
            timestamp: new Date().toISOString()
          })
        });
      } catch (webhookErr) {
        console.warn("[Hatch] Failed to trigger webhook:", webhookErr);
      }
    }

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
async function createSovereignDatabase(name: string, password: string) {
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
      plan: 'free',
      db_pass: password
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Supabase API error: ${error.message}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    url: `https://${data.id}.supabase.co`,
    anonKey: "sb_publishable_placeholder_pk", 
  };
}

/**
 * AI SQL Architect: Generates initial PostgreSQL schema
 */
async function generateInitialSchema(config: WizardConfig, description: string) {
  const prompt = `
    Generate a PostgreSQL schema for a new project.
    PROJECT: ${description}
    STACK: ${config.templateSlug}
    
    REQUIREMENTS:
    1. Output VALID SQL only. No markdown formatting.
    2. Include tables like 'profiles', 'settings', and core business entities.
    3. Include standard RLS (Row Level Security) policies using 'auth.uid()'.
    4. Enable 'uuid-ossp' extension.
    5. Add 'updated_at' triggers for consistency.
  `;

  const aiResult = await callOpenRouter([
    { role: 'system', content: 'You are an expert PostgreSQL Architect.' },
    { role: 'user', content: prompt }
  ], 'anthropic/claude-3.5-sonnet');

  let sql = aiResult.choices[0].message.content;
  // Basic cleanup
  if (sql.includes('```')) {
    sql = sql.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
  }
  return sql;
}


/**
 * Injects environment variables into a Vercel project
 */
async function injectVercelEnv(projectId: string, env: Record<string, string>, token: string, teamId?: string) {
  for (const [key, value] of Object.entries(env)) {
    await fetch(`https://api.vercel.com/v10/projects/${projectId}/env${teamId ? `?teamId=${teamId}` : ''}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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

/**
 * Creates a GitHub Environment
 */
async function createGitHubEnvironment(octokit: Octokit, owner: string, repo: string, name: string) {
  await octokit.rest.repos.createOrUpdateEnvironment({
    owner,
    repo,
    environment_name: name,
  });
  console.log(`[GitHub] Environment '${name}' created.`);
}

/**
 * Enforces branch protection rules
 */
async function setBranchProtection(octokit: Octokit, owner: string, repo: string, branch: string, checkName: string) {
  await octokit.rest.repos.updateBranchProtection({
    owner,
    repo,
    branch,
    required_status_checks: {
      strict: true,
      contexts: [checkName], // 'test' matches our CI job name in initra-ci.yml
    },
    enforce_admins: true,
    required_pull_request_reviews: null,
    restrictions: null,
  });
  console.log(`[GitHub] Branch protection enabled for '${branch}'.`);
}

/**
 * Updates the provisioning status in the database
 */
async function updateProvisioningStatus(projectId: string, update: Record<string, string>) {
  const supabase = await createClient();
  
  // First get current status to merge
  const { data: project } = await supabase
    .from('community_projects')
    .select('provisioning_status')
    .eq('id', projectId)
    .single();
    
  const currentStatus = project?.provisioning_status || {};
  
  await supabase
    .from('community_projects')
    .update({
      provisioning_status: { ...currentStatus, ...update }
    })
    .eq('id', projectId);
}

/**
 * Retrieves the current hatching status for a project
 */
export async function getHatchStatus(projectId: string) {
  const supabase = await createClient();
  
  const { data: project } = await supabase
    .from('community_projects')
    .select('provisioning_status, live_url, github_url, is_hatched')
    .eq('id', projectId)
    .single();
    
  if (!project) return null;

  // If live_url exists, we can attempt to fetch Vercel status
  let vercelStatus = 'building';
  if (project.live_url) {
     // For now, we'll assume 'ready' if is_hatched is true and the URL is reachable
     // Future logic can call Vercel API with the projectId/domain
     vercelStatus = project.is_hatched ? 'ready' : 'building';
  }

  return {
    provisioningStatus: project.provisioning_status || {},
    liveUrl: project.live_url,
    githubUrl: project.github_url,
    isHatched: project.is_hatched,
    vercelStatus
  };
}

/**
 * Creates a project entry in the community_projects table
 * to prepare it for hatching.
 */
export async function createHatchProject(
  name: string,
  description: string,
  config: WizardConfig
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Authentication required to hatch a project.');

  const { data, error } = await supabase
    .from('community_projects')
    .insert({
      title: name,
      description: description,
      user_id: user.id,
      blueprint_config: config,
      status: 'proposed',
      provisioning_status: {
        github: 'pending',
        vercel: 'pending',
        supabase: 'pending',
        dns: 'pending'
      }
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating hatch project:', error);
    throw new Error('Failed to initialize hatching record.');
  }

  return data.id;
}
