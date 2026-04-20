import { NextResponse } from "next/server";
import { generateAgentFiles } from "@/lib/engine";
import type { WizardConfig } from "@/lib/engine/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { templateSlug, templateVersion, projectName, stackConfig, selectedIDEs, selectedPackages, selectedServices } =
      body as WizardConfig;

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
    };

    const result = generateAgentFiles(config);

    return NextResponse.json(result, { status: 200 });
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
