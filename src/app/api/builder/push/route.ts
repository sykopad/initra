import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Octokit } from "octokit";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { repoId, files, commitMessage, targetBranch } = await req.json();

    if (!repoId || !files || !Array.isArray(files)) {
      return NextResponse.json({ error: "Missing required fields or files array" }, { status: 400 });
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

    // 2. Orchestrate GitHub Multi-file Commit
    const octokit = new Octokit({ auth: providerToken });
    const branchName = targetBranch || repo.default_branch;

    // Check if branch exists, create if not
    try {
      await octokit.rest.repos.getBranch({
        owner: repo.owner,
        repo: repo.repo_name,
        branch: branchName
      });
    } catch (e) {
      // Branch doesn't exist, create it from default branch
      console.log(`[Push] Creating branch: ${branchName} from ${repo.default_branch}`);
      const { data: defaultBranchRef } = await octokit.rest.git.getRef({
        owner: repo.owner,
        repo: repo.repo_name,
        ref: `heads/${repo.default_branch}`
      });
      await octokit.rest.git.createRef({
        owner: repo.owner,
        repo: repo.repo_name,
        ref: `refs/heads/${branchName}`,
        sha: defaultBranchRef.object.sha
      });
    }

    // A. Get current commit SHA
    const { data: refData } = await octokit.rest.git.getRef({
      owner: repo.owner,
      repo: repo.repo_name,
      ref: `heads/${branchName}`
    });
    const latestCommitSha = refData.object.sha;

    // B. Create tree with multiple files
    const tree = files.map((f: any) => ({
      path: f.path,
      mode: '100644' as const,
      type: 'blob' as const,
      content: f.content
    }));

    const { data: newTree } = await octokit.rest.git.createTree({
      owner: repo.owner,
      repo: repo.repo_name,
      base_tree: latestCommitSha,
      tree
    });

    // C. Create commit
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner: repo.owner,
      repo: repo.repo_name,
      message: commitMessage || `🚀 Initra AI Builder: Multi-file sync to ${branchName}`,
      tree: newTree.sha,
      parents: [latestCommitSha]
    });

    // D. Update reference
    await octokit.rest.git.updateRef({
      owner: repo.owner,
      repo: repo.repo_name,
      ref: `heads/${branchName}`,
      sha: newCommit.sha,
      force: true
    });

    return NextResponse.json({
      success: true,
      commitSha: newCommit.sha,
      branch: branchName
    });

  } catch (err: any) {
    console.error("[Builder Push Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
