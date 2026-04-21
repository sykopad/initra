import { NextResponse } from "next/server";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const branch = searchParams.get('branch');

    if (!projectId || !branch) {
      return NextResponse.json({ error: "Missing projectId or branch" }, { status: 400 });
    }

    if (!VERCEL_TOKEN) {
      return NextResponse.json({ error: "Vercel token not configured" }, { status: 500 });
    }

    // Fetch deployments for this project and branch
    const url = `https://api.vercel.com/v6/deployments?projectId=${projectId}&gitBranch=${branch}${VERCEL_TEAM_ID ? `&teamId=${VERCEL_TEAM_ID}` : ''}`;
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      }
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.message }, { status: res.status });
    }

    const data = await res.json();
    const deployments = data.deployments || [];
    
    if (deployments.length === 0) {
      return NextResponse.json({ status: 'NOT_FOUND', message: 'No deployments found for this branch.' });
    }

    // Get the most recent deployment
    const latest = deployments[0];

    return NextResponse.json({
      status: latest.readyState, // READY, BUILDING, ERROR, INITIALIZING
      url: `https://${latest.url}`,
      deploymentId: latest.uid,
      createdAt: latest.createdAt
    });

  } catch (err: any) {
    console.error("[Builder Status Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
