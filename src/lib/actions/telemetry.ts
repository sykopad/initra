"use server";

/**
 * Initra — Telemetry Service
 * Real-time health monitoring for birthed ventures.
 */

import { createClient } from "@/lib/supabase/server";

export interface HealthReport {
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
  statusCode: number;
  ssl: boolean;
  lastChecked: string;
  vercel?: {
    status: string;
    deploymentId?: string;
    target?: string;
  };
}

/**
 * Performs a real-time health check on a venture's live URL.
 */
export async function checkVentureHealth(repoId: string, repoName?: string, owner?: string): Promise<HealthReport> {
  const supabase = await createClient();
  
  // 1. Fetch the live URL from the database
  let query = supabase.from('community_projects').select('live_url, id, user_id');
  
  if (repoName && owner) {
    query = query.ilike('github_url', `%${owner}/${repoName}%`);
  } else {
    query = query.eq('id', repoId);
  }

  const { data: repo, error } = await query.single();

  if (error || !repo || !repo.live_url) {
    return {
      status: 'unknown',
      responseTime: 0,
      statusCode: 0,
      ssl: false,
      lastChecked: new Date().toISOString()
    };
  }

  const start = Date.now();
  try {
    const response = await fetch(repo.live_url, { 
      method: 'GET', 
      cache: 'no-store',
      next: { revalidate: 0 } 
    });
    
    const responseTime = Date.now() - start;
    const ssl = repo.live_url.startsWith('https://');

    // 2. Fetch Vercel Status (optional)
    let vercelInfo = undefined;
    
    // Fetch profile for sovereign tokens
    const { data: profile } = await supabase
      .from('profiles')
      .select('vercel_token, vercel_team_id')
      .eq('id', repo.user_id) // We need the user_id from the project
      .single();

    const VERCEL_TOKEN = profile?.vercel_token || process.env.VERCEL_TOKEN;
    const VERCEL_TEAM_ID = profile?.vercel_team_id || process.env.VERCEL_TEAM_ID;

    if (VERCEL_TOKEN && repoName) {
      try {
        const vRes = await fetch(`https://api.vercel.com/v9/projects/${repoName}${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`, {
          headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
        });
        if (vRes.ok) {
          const vData = await vRes.json();
          vercelInfo = {
            status: vData.latestDeployments?.[0]?.readyState || 'READY',
            deploymentId: vData.latestDeployments?.[0]?.id,
            target: vData.latestDeployments?.[0]?.target || 'production'
          };
        }
      } catch (vErr) {
        console.warn("Vercel Telemetry Failed:", vErr);
      }
    }

    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime,
      statusCode: response.status,
      ssl,
      lastChecked: new Date().toISOString(),
      vercel: vercelInfo
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      statusCode: 503,
      ssl: repo.live_url.startsWith('https://'),
      lastChecked: new Date().toISOString()
    };
  }
}
