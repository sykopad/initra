"use server";

import { createClient } from "@/lib/supabase/server";
import { WizardConfig, GeneratedFile } from "@/lib/engine/types";

export async function saveWizardSession(config: WizardConfig, files: GeneratedFile[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Create Session
  const { data: session, error: sessionError } = await supabase
    .from("wizard_sessions")
    .insert({
      user_id: user?.id || null,
      template_id: null, // Would look up by slug ideally
      project_name: config.projectName,
      stack_config: config.stackConfig,
      selected_ides: config.selectedIDEs,
      generated_config: config,
      is_public: !!user, // Default to public if logged in, for sharing
      share_slug: Math.random().toString(36).substring(2, 10),
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  // 2. Save Produced Files
  const filesToInsert = files.map(file => ({
    session_id: session.id,
    ide_target: "universal", // Simplified mapping
    filename: file.filename,
    file_path: file.filePath,
    content: file.content,
  }));

  const { error: filesError } = await supabase
    .from("generated_files")
    .insert(filesToInsert);

  if (filesError) throw filesError;

  return session;
}

export async function updateWizardFile(sessionId: string, filename: string, content: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("generated_files")
    .update({ content })
    .eq("session_id", sessionId)
    .eq("filename", filename);

  if (error) throw error;
}

export async function updateWizardSessionStatus(sessionId: string, isPublic: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("wizard_sessions")
    .update({ is_public: isPublic })
    .eq("id", sessionId);

  if (error) throw error;
}
