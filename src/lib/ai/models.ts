/**
 * Initra AI Model Registry
 * Centralized configuration for models, pricing, and capabilities.
 * 
 * 1 credit = $0.05 (20 credits = $1.00)
 */

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  slug: string;
  description: string;
  creditCost: number;
  isPremium: boolean;
  contextLimit: string;
  releaseDate: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'OpenAI',
    slug: 'openai/gpt-4o-mini', // Fallback to 4o-mini if 5-mini is unavailable
    description: 'Ultra-fast, efficient model perfect for standard project scaffolding.',
    creditCost: 0,
    isPremium: false,
    contextLimit: '128k',
    releaseDate: 'Mar 2026'
  },
  {
    id: 'opus-4-7',
    name: 'Claude Opus 4.7',
    provider: 'Anthropic',
    slug: 'anthropic/claude-opus-4.7',
    description: 'The pinnacle of reasoning and coding capability. Best for complex architectures.',
    creditCost: 10,
    isPremium: true,
    contextLimit: '1,000,000',
    releaseDate: 'Apr 16, 2026'
  },
  {
    id: 'opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    slug: 'anthropic/claude-opus-4.6',
    description: 'High-fidelity logic and deep reasoning for advanced infrastructures.',
    creditCost: 10,
    isPremium: true,
    contextLimit: '1,000,000',
    releaseDate: 'Feb 4, 2026'
  },
  {
    id: 'gpt-5-3-codex',
    name: 'GPT-5.3-Codex',
    provider: 'OpenAI',
    slug: 'openai/gpt-5.3-codex',
    description: 'Optimized for massive codebase context and precise logic injections.',
    creditCost: 5,
    isPremium: true,
    contextLimit: '400,000',
    releaseDate: 'Feb 24, 2026'
  },
  {
    id: 'gpt-5-2-codex',
    name: 'GPT-5.2-Codex',
    provider: 'OpenAI',
    slug: 'openai/gpt-5.2-codex',
    description: 'Reliable, large-context codex for robust backend generation.',
    creditCost: 5,
    isPremium: true,
    contextLimit: '400,000',
    releaseDate: 'Jan 14, 2026'
  },
  {
    id: 'gemini-3-1-pro',
    name: 'Gemini 3.1 Pro Preview',
    provider: 'Google',
    slug: 'google/gemini-3.1-pro-preview',
    description: 'Massive 1M+ context window for full-stack synthesis.',
    creditCost: 4,
    isPremium: true,
    contextLimit: '1,048,576',
    releaseDate: 'Feb 19, 2026'
  },
  {
    id: 'qwen3-coder',
    name: 'Qwen3 Coder Next',
    provider: 'Qwen',
    slug: 'qwen/qwen3-coder-next',
    description: 'Next-gen open-weights coder with exceptional efficiency.',
    creditCost: 1,
    isPremium: true,
    contextLimit: '262,144',
    releaseDate: 'Feb 4, 2026'
  },
  {
    id: 'kat-coder-v2',
    name: 'KAT-Coder-Pro V2',
    provider: 'Kwaipilot',
    slug: 'kwaipilot/kat-coder-pro-v2',
    description: 'Specialized enterprise coder for rapid infrastructure generation.',
    creditCost: 1,
    isPremium: true,
    contextLimit: '256,000',
    releaseDate: 'Mar 27, 2026'
  }
];

export function getModelBySlug(slug: string): AIModel | undefined {
  return AI_MODELS.find(m => m.slug === slug);
}

export function getDefaultModel(): AIModel {
  return AI_MODELS[0];
}
