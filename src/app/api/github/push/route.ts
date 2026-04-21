import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Octokit } from "octokit";

export async function POST(req: Request) {
  try {
    const { repoName, isPrivate, files, description } = await req.json();

    if (!repoName || !files || !Array.isArray(files)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const cookieStore = await cookies();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Retrieve the provider token (GitHub Access Token)
    // Fallback to the secure cookie if the session doesn't have the provider_token
    const providerToken = session.provider_token || cookieStore.get("sb-github-token")?.value;

    if (!providerToken) {
      return NextResponse.json({ 
        error: "GitHub token not found. Please log out and sign back in to grant repository access." 
      }, { status: 401 });
    }

    const octokit = new Octokit({ auth: providerToken });

    // 1. Create the repository
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      private: isPrivate === undefined ? true : isPrivate,
      auto_init: true, 
      description: description || "Project bootstrapped with Initra AI (https://initra.app)",
    });

    const owner = repo.owner.login;
    const repoSlug = repo.name;

    // 2. Prepare the tree for commit
    // We create blobs for each file
    const blobs = await Promise.all(
      files.map(async (file: any) => {
        const { data: blob } = await octokit.rest.git.createBlob({
          owner,
          repo: repoSlug,
          content: file.content,
          encoding: "utf-8",
        });
        return {
          path: file.filePath,
          mode: "100644",
          type: "blob",
          sha: blob.sha,
        };
      })
    );

    // 3. Get the latest commit on main
    const { data: ref } = await octokit.rest.git.getRef({
      owner,
      repo: repoSlug,
      ref: "heads/main",
    });
    const latestCommitSha = ref.object.sha;

    // 4. Create a new tree
    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo: repoSlug,
      base_tree: latestCommitSha,
      tree: blobs as any,
    });

    // 5. Create a new commit
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo: repoSlug,
      message: "🚀 Initiate Infrastructure: Bootstrap agent configuration",
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    // 6. Update the ref
    await octokit.rest.git.updateRef({
      owner,
      repo: repoSlug,
      ref: "heads/main",
      sha: newCommit.sha,
    });

    return NextResponse.json({ 
      success: true, 
      url: repo.html_url,
      repoFullName: repo.full_name 
    });

  } catch (err: any) {
    console.error("GitHub Push Error:", err);
    return NextResponse.json({ 
      error: err.message || "Failed to push to GitHub" 
    }, { status: 500 });
  }
}
