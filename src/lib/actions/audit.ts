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
export async function repairAuditAction(repoId: string, check: AuditCheck, framework: string) {
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

  // 2. Determine target file (heuristic for now based on check type)
  let targetFile = "README.md"; // Default
  if (check.id === 'seo-basics') targetFile = framework === 'nextjs' ? 'src/app/sitemap.ts' : 'public/robots.txt';
  if (check.id === 'seo-og') targetFile = framework === 'nextjs' ? 'src/app/layout.tsx' : 'nuxt.config.ts';
  if (check.id === 'sec-middleware') targetFile = 'middleware.ts';
  if (check.id === 'acc-landmarks') targetFile = framework === 'nextjs' ? 'src/app/layout.tsx' : 'app.vue';
  
  // 3. Generate Repair Instructions
  const prompt = generateRepairPrompt(check, framework);
  const adr = generateAuditADR(check, framework);

  // 4. Call AI to generate the fix
  // For a real implementation, we might fetch the actual file content from GitHub first
  // But for the pro version, we'll ask the AI to generate the COMPLETE file content based on the prompt.
  
  const messages = [
    { role: 'system', content: "You are an expert developer. Return only the code content for the requested file, no explanation, no markdown blocks." },
    { role: 'user', content: `${prompt}\n\nTarget File: ${targetFile}\nProvide the full source code for this file to resolve the issue.` }
  ];

  try {
    const aiResponse = await callOpenRouter(messages as any, 'pro');
    const newCode = aiResponse.choices[0].message.content.trim();

    return {
      success: true,
      newCode,
      filePath: targetFile,
      adr: adr
    };
  } catch (err: any) {
    console.error("Repair Action Failed:", err);
    throw new Error("AI Repair failed: " + err.message);
  }
}
