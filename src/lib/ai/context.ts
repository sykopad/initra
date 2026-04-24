import { Octokit } from "octokit";
import { createClient } from "@/lib/supabase/server";

/**
 * Initra — AI Context Engine
 * Fetches repository-specific AGENTS.md and relevant community skills.
 */
export async function getAIContext(repo: { 
  owner: string; 
  repo_name: string; 
  framework: string; 
  default_branch: string; 
}, providerToken: string, category?: string) {
  let agentsContext = "";
  
  // 1. Fetch AGENTS.md from GitHub
  try {
    const octokit = new Octokit({ auth: providerToken });
    const { data: agentsData }: any = await octokit.rest.repos.getContent({
      owner: repo.owner,
      repo: repo.repo_name,
      path: 'AGENTS.md',
      ref: repo.default_branch
    });
    agentsContext = Buffer.from(agentsData.content, 'base64').toString();
  } catch (e) {
    // AGENTS.md not found, ignore
  }

  // 2. Fetch relevant Agent Skills from DB
  const supabase = await createClient();
  let query = supabase
    .from('agent_skills')
    .select('name, description, prompt_template')
    .or(`target_framework.eq.${repo.framework},target_framework.eq.universal`);

  if (category) {
    // Attempt to match the specific category first
    const { data: catSkills } = await query
      .ilike('category', `%${category}%`)
      .order('vote_score', { ascending: false })
      .limit(5);
    
    if (catSkills && catSkills.length > 0) {
      return formatSkills(catSkills, agentsContext);
    }
  }

  // Fallback: Broad skills for the framework
  const { data: skills } = await supabase
    .from('agent_skills')
    .select('name, description, prompt_template')
    .or(`target_framework.eq.${repo.framework},target_framework.eq.universal`)
    .order('vote_score', { ascending: false })
    .limit(5);

  return formatSkills(skills || [], agentsContext);
}

function formatSkills(skills: any[], agentsContext: string) {
  const skillsContext = skills.map(s => `
NAME: ${s.name}
DESCRIPTION: ${s.description}
INSTRUCTION: ${s.prompt_template}
`).join('\n---') || "No specialized skills found for this framework.";

  return {
    agentsContext,
    skillsContext
  };
}
