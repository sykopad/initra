import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Octokit } from "octokit";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { repoId, branchName } = await req.json();

    if (!repoId || !branchName) {
      return NextResponse.json({ error: "Missing repoId or branchName" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const cookieStore = await cookies();
    const providerToken = session?.provider_token || cookieStore.get("sb-github-token")?.value;

    if (!providerToken) {
      return NextResponse.json({ error: "GitHub token missing" }, { status: 401 });
    }

    // 1. Fetch Repo Info
    const { data: repo } = await supabase
      .from('synced_repositories')
      .select('*')
      .eq('id', repoId)
      .single();

    if (!repo) throw new Error("Repo not found");

    const octokit = new Octokit({ auth: providerToken });

    // 2. Merge Preview Branch into Main
    console.log(`[Merge] Merging ${branchName} into ${repo.default_branch}`);
    await octokit.rest.repos.merge({
      owner: repo.owner,
      repo: repo.repo_name,
      base: repo.default_branch,
      head: branchName,
      commit_message: `🚢 Initra: Finalized changes from preview branch ${branchName}`
    });

    // 3. Delete the Preview Branch (Cleanup)
    console.log(`[Merge] Deleting branch: ${branchName}`);
    await octokit.rest.git.deleteRef({
      owner: repo.owner,
      repo: repo.repo_name,
      ref: `heads/${branchName}`
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("[Builder Merge Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
