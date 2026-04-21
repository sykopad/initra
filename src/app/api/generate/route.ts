import { NextResponse } from "next/server";
import { generateAgentFiles } from "@/lib/engine";
import type { WizardConfig } from "@/lib/engine/types";
import { createClient } from "@/lib/supabase/server";
import { getModelForTier, UserTier } from "@/lib/ai/openrouter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // 1. Determine User Tier
    const { data: { user } } = await supabase.auth.getUser();
    let tier: UserTier = 'community';
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single();
      
      if (profile && profile.tier) {
        tier = profile.tier as UserTier;
      } else {
        tier = 'pro'; // Logged in but no tiered profile yet
      }
    }

    const { 
      templateSlug, 
      templateVersion, 
      projectName, 
      stackConfig, 
      selectedIDEs, 
      selectedPackages, 
      selectedServices,
      modelSlug 
    } = body as WizardConfig;

    // 2. Identify Model and Pricing
    const { getModelBySlug, getDefaultModel } = await import("@/lib/ai/models");
    const { deductCredits } = await import("@/lib/credits/service");
    
    const selectedModel = modelSlug ? getModelBySlug(modelSlug) : getDefaultModel();
    const modelToUse = selectedModel?.slug || "openai/gpt-4o-mini";
    
    if (selectedModel?.isPremium) {
      if (!user) {
        return NextResponse.json({ error: "Premium models require login." }, { status: 401 });
      }
      
      const deduction = await deductCredits(
        user.id, 
        selectedModel.creditCost, 
        `Generation using ${selectedModel.name} for project: ${projectName || "Untitled"}`
      );

      if (!deduction.success) {
        return NextResponse.json({ error: deduction.error }, { status: 403 });
      }
    }

    console.log(`[Generate API] Using model: ${modelToUse} for user: ${user?.id || 'anonymous'}`);

    if (!templateSlug) {
      return NextResponse.json(
        { error: "templateSlug is required" },
        { status: 400 }
      );
    }

    if (!selectedIDEs || selectedIDEs.length === 0) {
      return NextResponse.json(
        { error: "At least one IDE must be selected" },
        { status: 400 }
      );
    }

    // Generate the files
    const config: WizardConfig = {
      templateSlug,
      templateVersion: templateVersion || String(stackConfig?.version || ""),
      projectName: projectName || "My Project",
      stackConfig: stackConfig || {},
      selectedIDEs,
      selectedPackages: selectedPackages ?? [],
      selectedServices: selectedServices ?? [],
      experienceLevel: body.experienceLevel ?? 'experienced',
      modelSlug: selectedModel?.slug
    };

    const result = generateAgentFiles(config);

    return NextResponse.json({
      ...result,
      metadata: {
        model,
        tier
      }
    }, { status: 200 });
  } catch (error) {
    console.error("[Generate API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate agent files",
      },
      { status: 500 }
    );
  }
}
