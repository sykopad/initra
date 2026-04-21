/**
 * Initra — Hatch Engine
 * Orchestrates the autonomous birth of a venture.
 */

import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';
import { generateAgentFiles } from '@/lib/engine';
import { WizardConfig } from '@/lib/engine/types';

import { Client } from 'pg';
import { callOpenRouter } from '@/lib/ai/openrouter';

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
      
    } catch (sbErr) {
      console.warn("[Hatch] Database orchestration failed:", sbErr);
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
    config.includeTests = true; // Hatching 3.0
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
 * PG Migration Runner: Executes SQL against the sovereign database
 */
async function applyInitialSchema(dbId: string, sql: string, password: string) {
  const client = new Client({
    host: `db.${dbId}.supabase.co`,
    port: 5432,
    user: 'postgres',
    password: password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log(`[PG] Schema applied successfully to ${dbId}`);
  } catch (err: any) {
    console.error(`[PG] Schema application failed for ${dbId}:`, err);
    throw err;
  } finally {
    await client.end();
  }
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
