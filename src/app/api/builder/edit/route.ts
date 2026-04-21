import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Octokit } from "octokit";
import { cookies } from "next/headers";
import { callOpenRouter } from "@/lib/ai/openrouter";

export async function POST(req: Request) {
  try {
    const { repoId, segmentId, userPrompt } = await req.json();

    if (!repoId || !segmentId || !userPrompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const cookieStore = await cookies();
    const providerToken = session?.provider_token || cookieStore.get("sb-github-token")?.value;

    if (!providerToken) {
      return NextResponse.json({ error: "GitHub token missing" }, { status: 401 });
    }

    // 1. Fetch Segment and Repo Info
    const { data: segment, error: segmentError } = await supabase
      .from('repo_segments')
      .select('*, synced_repositories(*)')
      .eq('id', segmentId)
      .single();

    if (segmentError || !segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    const { synced_repositories: repo } = segment as any;

    // 2. Fetch Current Content from GitHub
    const octokit = new Octokit({ auth: providerToken });
    const { data: fileData }: any = await octokit.rest.repos.getContent({
      owner: repo.owner,
      repo: repo.repo_name,
      path: segment.file_path,
      ref: repo.default_branch
    });

    const currentContent = Buffer.from(fileData.content, 'base64').toString();

    // 3. AI Targeted Edit
    const systemPrompt = `
      You are an expert Frontend Engineer and AI Component Builder.
      Your task is to modify a specific code file based on a user's request.
      
      CONTEXT:
      - Repository Framework: ${repo.framework}
      - UI Segment: ${segment.name} (${segment.type})
      - Current File Path: ${segment.file_path}
      
      RULES:
      1. ONLY return the updated code. No explanations, no markdown blocks unless necessary for the file type, just the raw code.
      2. PRESERVE existing functionality and imports unless the user asks to change them.
      3. FOLLOW the existing code style and naming conventions.
      4. IMPROVE aesthetics if the user mentions styling, colors, or fonts.
    `;

    const aiResult = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `REQUEST: ${userPrompt}\n\nCURRENT CODE:\n${currentContent}` }
    ], 'anthropic/claude-3.5-sonnet'); // Use high-tier for code edits

    // Clean up AI response if it wrapped it in markdown
    let updatedCode = aiResult.choices[0].message.content;
    if (updatedCode.startsWith('```')) {
      updatedCode = updatedCode.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
    }

    return NextResponse.json({
      success: true,
      updatedCode,
      filePath: segment.file_path,
      sha: fileData.sha
    });

  } catch (err: any) {
    console.error("[Builder Edit Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
