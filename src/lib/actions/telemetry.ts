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

  // 1.5 Fallback to synced_repositories for userId if project not yet in community
  let liveUrl = repo?.live_url;
  let userId = repo?.user_id;

  if (!userId) {
    const { data: syncedRepo } = await supabase
      .from('synced_repositories')
      .select('user_id')
      .eq('id', repoId)
      .single();
    if (syncedRepo) userId = syncedRepo.user_id;
  }

  // 2. Proactively Fetch Vercel Status & discovery URL if needed
  let vercelInfo = undefined;
  const { data: profile } = await supabase
    .from('profiles')
    .select('vercel_token, vercel_team_id')
    .eq('id', userId) 
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

        // Fallback discovery: If we don't have a liveUrl, use Vercel's production alias
        if (!liveUrl && vData.targets?.production?.alias?.[0]) {
          liveUrl = `https://${vData.targets.production.alias[0]}`;
        }
      }
    } catch (vErr) {
      console.warn("Vercel Telemetry Failed:", vErr);
    }
  }

  // 3. Perform Health Ping
  const start = Date.now();
  let responseStatus: 'healthy' | 'unhealthy' | 'unknown' = 'unknown';
  let statusCode = 0;
  let responseTime = 0;
  let ssl = false;

  try {
    if (liveUrl) {
      const response = await fetch(liveUrl, { 
        method: 'GET', 
        cache: 'no-store',
        next: { revalidate: 0 } 
      });
      responseTime = Date.now() - start;
      responseStatus = response.ok ? 'healthy' : 'unhealthy';
      statusCode = response.status;
      ssl = liveUrl.startsWith('https://');
    }

    return {
      status: responseStatus,
      responseTime,
      statusCode,
      ssl,
      lastChecked: new Date().toISOString(),
      vercel: vercelInfo
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      statusCode: 503,
      ssl: liveUrl ? liveUrl.startsWith('https://') : false,
      lastChecked: new Date().toISOString(),
      vercel: vercelInfo
    };
  }
}
