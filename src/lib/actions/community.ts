"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCommunityProjects(filter: string = "All") {
  const supabase = await createClient();
  
  let query = supabase
    .from("community_projects")
    .select("*")
    .order("venture_type", { ascending: false }) // AI-generated first
    .order("vote_score", { ascending: false });

  if (filter !== "All") {
    const statusMap: Record<string, string> = {
      Proposed: "proposed",
      "In Progress": "in_progress",
      "Needs Agents": "needs_agents",
      Completed: "completed",
    };
    query = query.eq("status", statusMap[filter]);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching community projects:", error);
    return [];
  }
  
  return data;
}

export async function hatchVentureAction(projectId: string) {
  const { hatchVenture } = await import("@/lib/actions/hatch");
  try {
    const result = await hatchVenture(projectId);
    revalidatePath("/community");
    return result;
  } catch (err: any) {
    throw new Error(err.message || "Failed to hatch venture");
  }
}

export async function voteProject(projectId: string, value: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to vote");
  }

  // Handle vote logic
  if (value === 0) {
    // Remove vote
    const { error } = await supabase
      .from("project_votes")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id);
      
    if (error) throw error;
  } else {
    // Upsert vote
    const { error } = await supabase
      .from("project_votes")
      .upsert({
        project_id: projectId,
        user_id: user.id,
        value: value
      });
      
    if (error) throw error;
  }

  revalidatePath("/community");
}

export async function suggestProject(formData: {
  title: string;
  description: string;
  category: string;
  impactStatement: string;
  tags: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to suggest a project");
  }

  const { data, error } = await supabase
    .from("community_projects")
    .insert({
      ...formData,
      suggested_by: user.id,
      vote_score: 1, // Auto-upvote by creator
    })
    .select()
    .single();

  if (error) throw error;

  // Add the initial vote as well
  await supabase.from("project_votes").insert({
    project_id: data.id,
    user_id: user.id,
    value: 1
  });

  revalidatePath("/community");
  return data;
}

export async function generateVentureBlueprintAction() {
  const { generateDailyBlueprint } = await import("@/lib/engine/blueprint-generator");
  const { deductCredits } = await import("@/lib/credits/service");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be logged in to request a new venture blueprint.");

  // 1. Rate Limit Check: One per 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentGenerations, error: rateLimitError } = await supabase
    .from("community_projects")
    .select("id")
    .eq("suggested_by", user.id)
    .eq("venture_type", "ai-generated")
    .gt("created_at", twentyFourHoursAgo);

  if (rateLimitError) {
    console.error("Rate limit check failed:", rateLimitError);
  } else if (recentGenerations && recentGenerations.length > 0) {
    throw new Error("Daily limit reached. You can generate one venture blueprint every 24 hours.");
  }

  // 2. Credit Check & Intermediate Deduction
  const COST = 50;
  const deduction = await deductCredits(user.id, COST, "AI Venture Generation");
  if (!deduction.success) {
    throw new Error(deduction.error || "Insufficient credits (Requires 50).");
  }

  try {
    // 3. Generate Blueprint
    const blueprint = await generateDailyBlueprint();
    
    // 4. Save to Community Hub
    const { data, error } = await supabase
      .from("community_projects")
      .insert({
        title: blueprint.title,
        description: blueprint.description,
        category: blueprint.category,
        impact_statement: blueprint.impactStatement,
        tags: blueprint.suggestedBrains,
        venture_type: 'ai-generated',
        status: 'proposed',
        blueprint_config: blueprint.wizardConfig,
        suggested_by: user.id, // Store who requested it
        vote_score: 1 
      })
      .select()
      .single();

    if (error) {
      // In case of DB error, we *should* refund, but for now we'll just log
      console.error("DB Insert failed after credit deduction:", error);
      throw error;
    }
    
    revalidatePath("/community");
    return data;
  } catch (err: any) {
    console.error("Venture generation failed:", err);
    // FALLBACK: Could implement refund logic here if deduction was successful but generation failed
    throw new Error(err.message || "Failed to generate AI venture. Credits were consumed for the attempt.");
  }
}

export async function forkVentureAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get project blueprint
  const { data: project, error: fetchError } = await supabase
    .from("community_projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (fetchError || !project) throw new Error("Venture not found");

  const config = project.blueprint_config || project.config;
  if (!config) throw new Error("No configuration found to fork");

  // Create new wizard session
  const { data: session, error: sessionError } = await supabase
    .from("wizard_sessions")
    .insert({
      user_id: user.id,
      project_name: `${project.title} (Fork)`,
      template_id: config.templateSlug,
      current_step: 6, // Skip to confirmation/IDE step
      config: config
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  revalidatePath("/dashboard");
  return { sessionId: session.id };
}

export async function getUserVotes() {
// ...
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return {};

  const { data, error } = await supabase
    .from("project_votes")
    .select("project_id, value")
    .eq("user_id", user.id);

  if (error) {
    console.warn("Error fetching user votes:", error);
    return {};
  }

  return data.reduce((acc: Record<string, number>, vote) => {
    acc[vote.project_id] = vote.value;
    return acc;
  }, {});
}
