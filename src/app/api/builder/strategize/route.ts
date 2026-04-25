import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/ai/openrouter";
import { getModelBySlug } from "@/lib/ai/models";

export async function POST(req: Request) {
  try {
    const { repoId, modelSlug } = await req.json();

    if (!repoId) {
      return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Repo Data & Segments
    const { data: repo, error: repoError } = await supabase
      .from('synced_repositories')
      .select('*')
      .eq('id', repoId)
      .single();

    if (repoError || !repo) {
      throw new Error("Repository not found");
    }

    const { data: segments } = await supabase
      .from('repo_segments')
      .select('*')
      .eq('repo_id', repoId);

    // 2. Construct the Strategy Prompt
    const segmentsList = (segments || []).map(s => `- ${s.name} (${s.type}): ${s.description}`).join('\n');
    
    const systemPrompt = `You are the Initra Venture Strategist, an elite AI architect. 
Your goal is to analyze a user's repository segments and provide a high-fidelity strategic roadmap and specific actionable suggestions to evolve their SaaS.

Analyze the provided segments and return a JSON object with the following structure:
{
  "strategy": {
    "summary": "A concise, high-level summary of the venture's current state and potential.",
    "alignmentScore": 0-100 (how close it is to a production-ready SaaS),
    "suggestions": [
      {
        "id": "unique-id",
        "category": "feature" | "performance" | "monetization" | "security" | "architecture",
        "title": "Short title",
        "description": "Detailed explanation of why this is needed.",
        "impact": "high" | "medium" | "low",
        "effort": "easy" | "medium" | "hard",
        "estimatedCredits": number (cost to implement),
        "studioPrompt": "A high-fidelity prompt for the Initra Creative Studio to implement this change."
      }
    ],
    "roadmap": [
      {
        "title": "Step title",
        "status": "todo" | "done",
        "description": "What needs to be done in this step."
      }
    ]
  }
}

Be specific to the tech stack (Next.js/Nuxt/etc.). 
Suggestions should be actable via the Creative Studio. 
The roadmap should show a logical progression from MVP to Scale.`;

    const userPrompt = `
Venture Name: ${repo.repo_name}
Framework: ${repo.framework}
Current Segments:
${segmentsList}

Provide a comprehensive strategy to take this venture to the next level.
Focus on missing features (like Auth, Billing, Landing Pages), performance optimizations, and infrastructure hardening.
`;

    const model = getModelBySlug(modelSlug) || { slug: 'openai/gpt-4o-mini' };

    const aiRes = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], model.slug, true);

    const result = typeof aiRes.choices[0].message.content === 'string' 
      ? JSON.parse(aiRes.choices[0].message.content)
      : aiRes.choices[0].message.content;

    return NextResponse.json({
      success: true,
      strategy: result.strategy
    });

  } catch (err: any) {
    console.error("[Strategize Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
