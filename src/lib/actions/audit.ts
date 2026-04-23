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

  // 4. Determine target file (heuristic for now based on check type)
  let targetFile = "README.md"; // Default
  if (check.id === 'seo-basics') targetFile = framework === 'nextjs' ? 'src/app/sitemap.ts' : 'public/robots.txt';
  if (check.id === 'seo-og') targetFile = framework === 'nextjs' ? 'src/app/layout.tsx' : 'nuxt.config.ts';
  if (check.id === 'sec-middleware') targetFile = 'middleware.ts';
  if (check.id === 'acc-landmarks') targetFile = framework === 'nextjs' ? 'src/app/layout.tsx' : 'app.vue';
  
  // 5. Generate Repair Instructions
  const prompt = generateRepairPrompt(check, framework);
  const adr = generateAuditADR(check, framework);

  // 6. Call AI to generate the fix
  const messages = [
    { role: 'system', content: "You are an expert developer. Return only the code content for the requested file, no explanation, no markdown blocks." },
    { role: 'user', content: `${prompt}\n\nTarget File: ${targetFile}\nProvide the full source code for this file to resolve the issue.` }
  ];

  try {
    const aiResponse = await callOpenRouter(messages as any, model.slug, false);
    const newCode = aiResponse.choices[0].message.content.trim();

    return {
      success: true,
      newCode,
      filePath: targetFile,
      adr: adr,
      newBalance: deduction.newBalance
    };
  } catch (err: any) {
    console.error("Repair Action Failed:", err);
    throw new Error("AI Repair failed: " + err.message);
  }
}
