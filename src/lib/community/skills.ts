import { createClient } from '../supabase/server';
import { CommunitySkill } from '../engine/types';

/**
 * Community Skill Service
 * Handles the publishing, discovery, and voting of community-contributed 
 * agent skills and architectural blueprints.
 */

export async function publishCommunitySkill(skill: Omit<CommunitySkill, 'id' | 'created_at' | 'updated_at' | 'vote_score' | 'creator_id'>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Authentication required to publish skills.');

  const { data, error } = await supabase
    .from('community_skills')
    .insert({
      creator_id: user.id,
      name: skill.name,
      slug: skill.slug,
      description: skill.description,
      category: skill.category,
      version: skill.version,
      ide_targets: skill.ide_targets,
      content: skill.content,
      is_published: skill.is_published,
      tags: skill.tags || []
    })
    .select()
    .single();

  if (error) {
    console.error('[Community] Failed to publish skill:', error);
    throw error;
  }

  return data;
}

export async function getPublishedSkills(limit = 20) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('community_skills')
    .select('*')
    .eq('is_published', true)
    .order('vote_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Community] Error fetching skills:', error);
    return [];
  }

  return data;
}

export async function voteForSkill(skillId: string, direction: 'up' | 'down') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Authentication required to vote.');

  // Logic for voting (would normally involve a separate votes table and a trigger)
  // For now, we'll assume a simplified direct increment/decrement if allowed by RLS
  const increment = direction === 'up' ? 1 : -1;
  
  const { error } = await supabase.rpc('vote_community_skill', {
    target_id: skillId,
    vote_delta: increment
  });

  if (error) {
    console.error('[Community] Voting error:', error);
    throw error;
  }
}

/**
 * Transforms a user's local "Sovereign Memory" into a publishable Community Skill.
 */
export function transformMemoryToSkillTemplate(memory: any, name: string): Partial<CommunitySkill> {
  return {
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description: `Architectural pattern based on successful ${memory.project_type} deployment.`,
    category: memory.project_type,
    version: '1.0.0',
    content: `## 🧠 Sovereign Architectural Skill\n\n### Stack Decisions\n${JSON.stringify(memory.stack_decisions, null, 2)}\n\n### Logic Patterns\n${JSON.stringify(memory.logic_patterns, null, 2)}`,
    is_published: false
  };
}
