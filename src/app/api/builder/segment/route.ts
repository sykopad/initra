import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Octokit } from "octokit";
import { cookies } from "next/headers";
import { analyzeRepository } from "@/lib/engine/segment-analyzer";

export async function POST(req: Request) {
  try {
    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    // Parse owner/repo
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    const [_, owner, repoName] = match;

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

    const octokit = new Octokit({ auth: providerToken });

    // 1. Sync Repository in DB
    const { data: syncedRepo, error: repoError } = await supabase
      .from('synced_repositories')
      .upsert({
        user_id: user.id,
        owner,
        repo_name: repoName,
        last_synced_at: new Date().toISOString()
      }, { onConflict: 'owner,repo_name' })
      .select()
      .single();

    if (repoError || !syncedRepo) {
      throw new Error(`Failed to sync repository: ${repoError?.message}`);
    }

    // 2. Deep Analysis
    const analysis = await analyzeRepository(octokit, owner, repoName, syncedRepo.default_branch);

    // Update framework
    await supabase
      .from('synced_repositories')
      .update({ framework: analysis.framework })
      .eq('id', syncedRepo.id);

    // 3. Save Segments
    // Clear old segments first
    await supabase.from('repo_segments').delete().eq('repo_id', syncedRepo.id);

    // Insert new ones
    if (analysis.segments.length > 0) {
      const { error: segmentError } = await supabase
        .from('repo_segments')
        .insert(
          analysis.segments.map(s => ({
            repo_id: syncedRepo.id,
            name: s.name,
            type: s.type,
            file_path: s.filePath,
            description: s.description
          }))
        );

      if (segmentError) throw new Error(`Failed to save segments: ${segmentError.message}`);
    }

    return NextResponse.json({
      success: true,
      repoId: syncedRepo.id,
      framework: analysis.framework,
      segments: analysis.segments,
      audit: analysis.audit
    });

  } catch (err: any) {
    console.error("[Builder Segment Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
