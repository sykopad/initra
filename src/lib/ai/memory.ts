import { createClient } from '../supabase/server';

/**
 * Sovereign Memory Service
 * Manages cross-session architectural persistence to ensure agents "remember" 
 * user preferences and past logic patterns.
 */

export interface SovereignMemory {
  project_type: string;
  stack_decisions: Record<string, any>;
  logic_patterns: Record<string, any>;
  orchestration_preference?: string;
}

export async function getSovereignMemory(projectType: string): Promise<SovereignMemory | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('sovereign_memory')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_type', projectType)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('[Memory] Error fetching sovereign memory:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Memory] Unexpected error fetching memory:', err);
    return null;
  }
}

export async function recordSovereignMemory(memory: Omit<SovereignMemory, 'user_id'>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  try {
    // Upsert memory
    const { error } = await supabase
      .from('sovereign_memory')
      .upsert({
        user_id: user.id,
        project_type: memory.project_type,
        stack_decisions: memory.stack_decisions,
        logic_patterns: memory.logic_patterns,
        orchestration_preference: memory.orchestration_preference,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'user_id, project_type'
      });

    if (error) {
      console.error('[Memory] Error recording sovereign memory:', error);
    } else {
      console.log(`[Memory] Sovereign memory updated for type: ${memory.project_type}`);
    }
  } catch (err) {
    console.error('[Memory] Unexpected error recording memory:', err);
  }
}

/**
 * Synthesizes past decisions into a prompt overlay for the generation engine.
 */
export function synthesizeMemoryContext(memory: SovereignMemory | null): string {
  if (!memory) return '';

  let context = '\n\n### 🧠 Sovereign Memory Recall\n';
  context += 'The user has previously favored the following architectural patterns for this project type:\n';

  if (memory.stack_decisions && Object.keys(memory.stack_decisions).length > 0) {
    context += '- **Stack Preferences**: ' + JSON.stringify(memory.stack_decisions) + '\n';
  }

  if (memory.logic_patterns && Object.keys(memory.logic_patterns).length > 0) {
    context += '- **Past Logic Patterns**: ' + JSON.stringify(memory.logic_patterns) + '\n';
  }

  if (memory.orchestration_preference) {
    context += `- **Orchestration Preference**: ${memory.orchestration_preference}\n`;
  }

  context += 'Please prioritize these patterns in the current generation if they align with the goal.\n';

  return context;
}
