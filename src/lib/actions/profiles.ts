"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: {
  display_name: string;
  github_username: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: formData.display_name,
      github_username: formData.github_username,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update error:", error);
    throw new Error(error.message);
  }

  // Also update user metadata if display_name changed
  await supabase.auth.updateUser({
    data: { full_name: formData.display_name }
  });

  revalidatePath("/settings");
  revalidatePath("/");
  
  return { success: true };
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
