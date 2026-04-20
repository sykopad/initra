"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveSharedConfig(
  projectName: string,
  templateSlug: string,
  config: any,
  userId: string
) {
  const supabase = await createClient();

  // Generate a readable slug: project-name-random
  const baseSlug = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const slug = `${baseSlug || "config"}-${randomSuffix}`;

  const { data, error } = await supabase
    .from("shared_configs")
    .insert({
      slug,
      user_id: userId,
      projectName,
      templateSlug,
      config,
    })
    .select()
    .single();

  if (error) {
    console.error("Save shared error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/community");
  return data;
}

export async function getSharedConfig(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shared_configs")
    .select("*, profiles(display_name, avatar_url)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Get shared error:", error);
    return null;
  }

  return data;
}

export async function getCommunityProjects() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shared_configs")
    .select("*, profiles(display_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Get community error:", error);
    return [];
  }

  return data;
}
