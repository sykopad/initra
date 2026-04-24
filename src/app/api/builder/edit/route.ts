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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    const cookieStore = await cookies();
    const providerToken = session?.provider_token || cookieStore.get("sb-github-token")?.value;

    if (!providerToken) {
      return NextResponse.json({ 
        error: "GitHub session expired", 
        message: "Your GitHub connection has expired. Please reconnect to continue." 
      }, { status: 401 });
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

    // 2.5 Fetch Global Styles for Context (Optional)
    let globalStyles = "";
    try {
      const { data: styleData }: any = await octokit.rest.repos.getContent({
        owner: repo.owner,
        repo: repo.repo_name,
        path: 'src/app/globals.css', // Next.js 16 standard
        ref: repo.default_branch
      });
      globalStyles = Buffer.from(styleData.content, 'base64').toString();
    } catch (e) {
      // Styles not found in src/app, ignore
    }

    // 3. AI Targeted Edit
    const systemPrompt = `
      You are an expert Frontend Engineer. Your task is to modify code files based on a user's request.
      
      CONTEXT:
      - Framework: ${repo.framework}
      - UI Segment: ${segment.name} (${segment.type})
      - Primary File: ${segment.file_path}
      
      GLOBAL STYLES (for reference):
      ${globalStyles}
      
      RULES:
      1. RETURN ONLY A JSON ARRAY of file updates. No markdown, no conversational text.
      2. If the change requires updating both the component AND the global CSS, return both files.
      3. Format: [{"path": "string", "content": "string", "explanation": "string"}]
      4. PRESERVE existing functionality. Use Next.js 16 and Vanilla CSS conventions.
    `;

    const aiResult = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `REQUEST: ${userPrompt}\n\nPRIMARY FILE CONTENT (${segment.file_path}):\n${currentContent}` }
    ], 'anthropic/claude-3.5-sonnet', true);

    // Parse JSON response
    let responseText = aiResult.choices[0].message.content;
    if (responseText.includes('[')) {
      responseText = responseText.substring(responseText.indexOf('['), responseText.lastIndexOf(']') + 1);
    }
    
    const fileUpdates = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      fileUpdates: fileUpdates.map((f: any) => ({
        ...f,
        originalContent: f.path === segment.file_path ? currentContent : "" // Simplification for now
      })),
      primaryFilePath: segment.file_path,
      primarySha: fileData.sha
    });

  } catch (err: any) {
    console.error("[Builder Edit Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
