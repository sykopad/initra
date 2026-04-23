import { NextResponse } from "next/server";
import { PROJECT_TEMPLATES } from "@/lib/engine/templates";
import { PACKAGE_LIBRARY } from "@/lib/engine/package-library";
import { SERVICE_LIBRARY } from "@/lib/engine/service-library";
import { callOpenRouter } from "@/lib/ai/openrouter";

export async function POST(request: Request) {
  try {
    const { goal, experienceLevel } = await request.json();

    if (!goal) {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    // Prepare context for the LLM
    const templatesContext = PROJECT_TEMPLATES.map(t => ({
      slug: t.slug,
      name: t.name,
      category: t.category,
      description: t.description
    }));

    const packagesContext = PACKAGE_LIBRARY.map(p => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
      compatibleTemplates: p.compatibleTemplates
    }));

    const servicesContext = SERVICE_LIBRARY.map(s => ({
      slug: s.slug,
      name: s.name,
      description: s.description
    }));

    const systemPrompt = `
You are the Initra AI Architect. Your job is to analyze a user's project goal and map it to our available technology stack.
You MUST output a valid JSON object matching the WizardConfig schema.

Available Templates:
${JSON.stringify(templatesContext, null, 2)}

Available Packages:
${JSON.stringify(packagesContext, null, 2)}

Available Services:
${JSON.stringify(servicesContext, null, 2)}

Rules:
1. Choose the most appropriate templateSlug based on the category.
2. Select 2-5 relevant package slugs that help achieve the goal.
3. Select relevant service slugs (e.g., 'stripe' for payments, 'supabase' for database).
4. For 'stackConfig', provide a reasonable default object mapping to the template's requirements (e.g. { "database": "supabase", "styling": "tailwind" }).
5. Experience Level is provided by user: ${experienceLevel}.

Output Format:
{
  "templateSlug": string,
  "projectName": string,
  "stackConfig": object,
  "selectedPackages": string[],
  "selectedServices": string[],
  "explanation": string (Short 2 sentence explanation of why this stack was chosen)
}
`;

    const response = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Goal: ${goal}` }
    ], 'community', true); // Use community tier for mapping with JSON mode enabled

    const result = JSON.parse(response.choices[0].message.content);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[Analyze Goal API] Error:", error);
    return NextResponse.json({ error: "Failed to analyze goal" }, { status: 500 });
  }
}
