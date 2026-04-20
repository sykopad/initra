import { NextResponse } from 'next/server';
import { generateDailyBlueprint } from '@/lib/engine/blueprint-generator';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/cron/daily-idea
 * Triggered daily to brainstorm new venture ideas.
 */
export async function GET(req: Request) {
  // Simple auth check for cron jobs (use a secret header)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const blueprint = await generateDailyBlueprint();
    const supabase = await createClient();

    // Save to community_projects as an 'ai-generated' venture
    const { data, error } = await supabase
      .from('community_projects')
      .insert({
        title: blueprint.title,
        description: blueprint.description,
        category: blueprint.category,
        impact_statement: blueprint.impactStatement,
        blueprint_config: blueprint.wizardConfig,
        agent_instructions: blueprint.workOrders.join('\n'),
        venture_type: 'ai-generated',
        status: 'proposed',
        tags: [blueprint.category, 'ai-generated', 'high-impact']
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      project: data 
    });
  } catch (err: any) {
    console.error('Cron Error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}
