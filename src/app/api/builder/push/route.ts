import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Octokit } from "octokit";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { repoId, filePath, content, commitMessage } = await req.json();

    if (!repoId || !filePath || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const cookieStore = await cookies();
    const providerToken = session?.provider_token || cookieStore.get("sb-github-token")?.value;

    if (!providerToken) {
      return NextResponse.json({ error: "GitHub token missing" }, { status: 401 });
    }

    // 1. Fetch Repo Info
    const { data: repo, error: repoError } = await supabase
      .from('synced_repositories')
      .select('*')
      .eq('id', repoId)
      .single();

    if (repoError || !repo) {
      return NextResponse.json({ error: "Repository record not found" }, { status: 404 });
    }

    // 2. Commit Change to GitHub
    const octokit = new Octokit({ auth: providerToken });
    
    // Get current file to get the SHA (needed for update)
    const { data: currentFile }: any = await octokit.rest.repos.getContent({
      owner: repo.owner,
      repo: repo.repo_name,
      path: filePath,
      ref: repo.default_branch
    });

    const sha = Array.isArray(currentFile) ? null : currentFile.sha;
    if (!sha) {
      throw new Error("Could not find file SHA for commit.");
    }

    const { data: commit } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: repo.owner,
      repo: repo.repo_name,
      path: filePath,
      message: commitMessage || `🚀 Initra AI Builder: Updated ${filePath}`,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch: repo.default_branch
    });

    return NextResponse.json({
      success: true,
      commitSha: commit.commit.sha,
      htmlUrl: commit.commit.html_url
    });

  } catch (err: any) {
    console.error("[Builder Push Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
