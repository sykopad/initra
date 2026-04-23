/**
 * OpenRouter Client Utility
 * Handles tiered model selection and prompt analysis
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export type UserTier = 'community' | 'pro' | 'elite';

import { AI_MODELS } from "./models";

export function getModelForTier(tier: UserTier = 'community'): string {
  switch (tier) {
    case 'elite':
      return AI_MODELS.find(m => m.id === 'opus-4-7')?.slug || 'anthropic/claude-3-opus';
    case 'pro':
      return AI_MODELS.find(m => m.id === 'gpt-5-3-codex')?.slug || 'openai/gpt-4o';
    case 'community':
    default:
      return AI_MODELS.find(m => m.id === 'gpt-5-mini')?.slug || 'openai/gpt-4o-mini';
  }
}

/**
 * Premium Model for Daily Idea Generation
 */
export const DAILY_IDEA_MODEL = 'anthropic/claude-opus-4.6';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function callOpenRouter(
  messages: ChatMessage[], 
  tierOrModel: UserTier | string = 'community'
) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // If the input is a known tier, resolve it; otherwise, treat it as a direct model slug
  const model = ['community', 'pro', 'elite'].includes(tierOrModel)
    ? getModelForTier(tierOrModel as UserTier)
    : tierOrModel;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://initra.ai", // Optional
      "X-Title": "Initra AI", // Optional
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": model,
      "messages": messages,
      "response_format": { "type": "json_object" }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter API Error: ${JSON.stringify(error)}`);
  }

  return response.json();
}
