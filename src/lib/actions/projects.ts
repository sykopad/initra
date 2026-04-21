"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Deletes a wizard session (Export History)
 */
export async function deleteProject(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("wizard_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting project:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Disconnects a synced repository
 */
export async function disconnectRepo(repoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("synced_repositories")
    .delete()
    .eq("id", repoId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error disconnecting repo:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  return { success: true };
}
