/**
 * Initra — Venture Blueprint Generator
 * Uses LLMs to generate high-fidelity project ideas and full Wizard configs.
 */

import { callOpenRouter, DAILY_IDEA_MODEL } from '../ai/openrouter';
import { WizardConfig, ProjectCategory } from './types';

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

Your output MUST be a valid JSON object following this interface:
{
  "title": string,
  "tagline": string,
  "description": string,
  "category": "web-app" | "mobile-app" | "api-backend" | "ai-ml" | "infrastructure",
  "impactStatement": string,
  "architectureReasoning": string, // Detailed technical justification for the chosen stack and approach
  "suggestedBrains": ["designer", "architect", "security"], // Which brains should lead this project
  "wizardConfig": {
    "templateSlug": string,
    "templateVersion": string,
    "projectName": string,
    "stackConfig": Record<string, string | boolean | string[]>,
    "selectedIDEs": ["universal", "cursor", "claude-code"],
    "selectedPackages": string[],
    "selectedServices": string[],
    "orchestrationMode": "multi-agent",
    "selectedOverlays": string[] // Map to the suggestedBrains here
  },
  "workOrders": string[] // 5-7 clear tasks for an autonomous agent to perform
}

Available Template Slugs: nextjs, django, nuxt, svelte-kit, fastapi, go-fiber, nestjs.
Design Principles:
1. Sovereign Infrastructure: Prioritize Supabase (DB/Auth) and Vercel.
2. High Fidelity: Provide enough detail in description for an agent to build a complete MVP.
3. Problem Solving: Focus on projects that solve real-world problems (sustainability, health, productivity).`;

export async function generateDailyBlueprint(): Promise<VentureBlueprint> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: 'Generate a new daily venture idea for a high-impact web application.' }
  ];

  // We use the DAILY_IDEA_MODEL for high-quality creative output
  const response = await callOpenRouter(messages as any, DAILY_IDEA_MODEL);
  
  try {
    const rawContent = response.choices[0].message.content;
    const blueprint = JSON.parse(rawContent) as VentureBlueprint;
    
    // Ensure some defaults
    blueprint.wizardConfig.selectedIDEs = blueprint.wizardConfig.selectedIDEs || ['universal'];
    blueprint.wizardConfig.orchestrationMode = blueprint.wizardConfig.orchestrationMode || 'multi-agent';
    
    return blueprint;
  } catch (err) {
    console.error('Failed to parse blueprint JSON:', err);
    throw new Error('AI generated invalid blueprint format');
  }
}
