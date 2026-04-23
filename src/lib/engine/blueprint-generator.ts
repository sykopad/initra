/**
 * Initra — Venture Blueprint Generator
 * Uses LLMs to generate high-fidelity project ideas and full Wizard configs.
 */

import { callOpenRouter, DAILY_IDEA_MODEL } from '../ai/openrouter';
import { WizardConfig, ProjectCategory } from './types';
import { parseAIJSON } from '../ai/json-extractor';

export interface VentureBlueprint {
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  impactStatement: string;
  architectureReasoning: string;
  suggestedBrains: string[];
  wizardConfig: WizardConfig;
  workOrders: string[];
}

const SYSTEM_PROMPT = `You are the Initra AI Principal Architect. Your goal is to generate a innovative, high-impact venture blueprint that can be automatically built by AI agents.

CRITICAL: Your entire response MUST be a single, valid JSON object. 
- DO NOT include conversational filler (e.g. "Here is your idea...").
- DO NOT wrap the output in markdown code blocks (e.g. \`\`\`json).
- Use valid JSON syntax exclusively.

Your output MUST follow this interface:
{
  "title": string,
  "tagline": string,
  "description": string,
  "category": "web-app" | "mobile-app" | "api-backend" | "ai-ml" | "infrastructure",
  "impactStatement": string,
  "architectureReasoning": string,
  "suggestedBrains": ["designer", "architect", "security"],
  "wizardConfig": {
    "templateSlug": string,
    "templateVersion": string,
    "projectName": string,
    "stackConfig": Record<string, string | boolean | string[]>,
    "selectedIDEs": ["universal", "cursor", "claude-code"],
    "selectedPackages": string[],
    "selectedServices": string[],
    "orchestrationMode": "multi-agent",
    "selectedOverlays": string[]
  },
  "workOrders": string[]
}

Available Template Slugs: nextjs, django, nuxt, svelte-kit, fastapi, go-fiber, nestjs.
Design Principles:
1. Sovereign Infrastructure: Prioritize Supabase (DB/Auth) and Vercel.
2. High Fidelity: Provide enough detail in description for an agent to build a complete MVP.
3. Problem Solving: Focus on projects that solve real-world problems.`;

export async function generateDailyBlueprint(): Promise<VentureBlueprint> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: 'Generate a new daily venture idea for a high-impact web application.' }
  ];

  const response = await callOpenRouter(messages as any, DAILY_IDEA_MODEL, true);
  
  try {
    const rawContent = response.choices[0].message.content;
    const blueprint = parseAIJSON<VentureBlueprint>(rawContent);
    
    // Ensure some defaults
    blueprint.wizardConfig.selectedIDEs = blueprint.wizardConfig.selectedIDEs || ['universal'];
    blueprint.wizardConfig.orchestrationMode = blueprint.wizardConfig.orchestrationMode || 'multi-agent';
    
    return blueprint;
  } catch (err) {
    console.error('Failed to parse blueprint JSON:', err);
    throw new Error('AI generated invalid blueprint format');
  }
}
