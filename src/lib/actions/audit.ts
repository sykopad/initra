"use server";

import { createClient } from "@/lib/supabase/server";
import { AuditCheck } from "@/lib/engine/types";
import { generateRepairPrompt } from "@/lib/engine/audit-repair-engine";
import { generateAuditADR } from "@/lib/engine/adr-generator";
import { callOpenRouter } from "@/lib/ai/openrouter";
import { Octokit } from "octokit";

/**
 * Orchestrates an AI-driven repair for a specific audit failure.
 */
export async function repairAuditAction(repoId: string, check: AuditCheck, framework: string, modelSlug?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Get Repo Details
  const { data: repo } = await supabase
    .from("synced_repositories")
    .select("*")
    .eq("id", repoId)
    .single();

  if (!repo) throw new Error("Repository not found");

  // 2. Determine target model and cost
  const { AI_MODELS } = await import("@/lib/ai/models");
  const model = AI_MODELS.find(m => m.slug === modelSlug) || AI_MODELS[0];
  
  // 3. Deduct Credits
  const { deductCredits } = await import("@/lib/credits/service");
  const deduction = await deductCredits(user.id, model.creditCost, `AI Repair: ${check.name} using ${model.name}`);
  if (!deduction.success) {
    throw new Error(deduction.error || "Insufficient credits.");
  }

  // 4. Generate Repair Instructions
  const prompt = generateRepairPrompt(check, framework);
  const adr = generateAuditADR(check, framework);

  // 6. Call AI to generate the fix (Multi-file support)
  const messages = [
    { 
      role: 'system', 
      content: `You are an expert developer. Resolve the audit failure by providing the necessary file updates.
      RETURN ONLY a JSON array of objects: [{"path": "string", "content": "string", "explanation": "string"}]
      No markdown blocks, no additional text.` 
    },
    { 
      role: 'user', 
      content: `${prompt}\n\nPlease generate the required files to fix this issue completely.` 
    }
  ];

  try {
    const aiResponse = await callOpenRouter(messages as any, model.slug, true); // JSON MODE ON
    let content = aiResponse.choices[0].message.content.trim();
    
    // Safety check for markdown blocks if the model ignored the system prompt
    if (content.includes("```")) {
      content = content.replace(/```json\n/g, "").replace(/```\n/g, "").replace(/```/g, "");
    }

    const files = JSON.parse(content);

    // 7. Inject Autonomous ADR into the file set
    if (adr) {
      files.push({
        path: adr.filePath,
        content: adr.content,
        explanation: `Architectural Decision Record for: ${check.title}`
      });
    }

    return {
      success: true,
      files, // Array of {path, content, explanation}
      adr: adr,
      newBalance: deduction.newBalance
    };
  } catch (err: any) {
    console.error("Repair Action Failed:", err);
    throw new Error("AI Repair failed: " + err.message);
  }
}
