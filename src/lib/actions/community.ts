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

export async function getUserVotes() {
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
