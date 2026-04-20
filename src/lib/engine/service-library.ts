// =============================================
// Initra — API & Service Registry
// Registry of external services and their env vars
// =============================================

import type { ApiService } from './types';

export const SERVICE_LIBRARY: ApiService[] = [
  // ── AI & LLM Providers ────────────────────────
  {
    slug: 'openai',
    name: 'OpenAI',
    registrationUrl: 'https://platform.openai.com/api-keys',
    description: 'GPT-4o, GPT-4o-mini, DALL-E, and Whisper APIs',
    icon: '🤖',
    category: 'llm',
    envVars: [
      { key: 'OPENAI_API_KEY', description: 'Your OpenAI secret API key', required: true, placeholder: 'sk-...' },
    ],
  },
  {
    slug: 'anthropic',
    name: 'Anthropic',
    registrationUrl: 'https://console.anthropic.com/settings/keys',
    description: 'Claude 3.5 Sonnet, Opus, and Haiku APIs',
    icon: '🏢',
    category: 'llm',
    envVars: [
      { key: 'ANTHROPIC_API_KEY', description: 'Your Anthropic API key', required: true, placeholder: 'sk-ant-...' },
    ],
  },
  {
    slug: 'deepseek',
    name: 'DeepSeek',
    registrationUrl: 'https://platform.deepseek.com/api_keys',
    description: 'High-performance, low-cost LLM provider',
    icon: '🐳',
    category: 'llm',
    envVars: [
      { key: 'DEEPSEEK_API_KEY', description: 'Your DeepSeek API key', required: true },
    ],
  },
  {
    slug: 'google-gemini',
    name: 'Google Gemini',
    registrationUrl: 'https://aistudio.google.com/app/apikey',
    description: 'Google Generative AI models (Gemini Pro, Flash)',
    icon: '♊',
    category: 'llm',
    envVars: [
      { key: 'GOOGLE_GENERATIVE_AI_API_KEY', description: 'Your Google AI Studio API key', required: true },
    ],
  },

  // ── Authentication ────────────────────────────
  {
    slug: 'clerk',
    name: 'Clerk',
    registrationUrl: 'https://dashboard.clerk.com/',
    description: 'Modern user management and authentication',
    icon: '👤',
    category: 'auth',
    envVars: [
      { key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', description: 'Clerk publishable key (client)', required: true, placeholder: 'pk_test_...' },
      { key: 'CLERK_SECRET_KEY', description: 'Clerk secret key (server)', required: true, placeholder: 'sk_test_...' },
    ],
  },

  // ── Payments ──────────────────────────────────
  {
    slug: 'stripe',
    name: 'Stripe',
    registrationUrl: 'https://dashboard.stripe.com/apikeys',
    description: 'Global payment infrastructure',
    icon: '💳',
    category: 'payments',
    envVars: [
      { key: 'STRIPE_SECRET_KEY', description: 'Stripe secret API key', required: true, placeholder: 'sk_test_...' },
      { key: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook signing secret', required: false, placeholder: 'whsec_...' },
      { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', description: 'Stripe publishable key (client)', required: true, placeholder: 'pk_test_...' },
    ],
  },
  {
    slug: 'paystack',
    name: 'Paystack',
    registrationUrl: 'https://dashboard.paystack.com/#/settings/developer',
    description: 'Payments for Africa',
    icon: '💰',
    category: 'payments',
    envVars: [
      { key: 'PAYSTACK_SECRET_KEY', description: 'Paystack secret key', required: true, placeholder: 'sk_test_...' },
      { key: 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY', description: 'Paystack public key (client)', required: true, placeholder: 'pk_test_...' },
    ],
  },

  // ── Database & Infrastructure ─────────────────
  {
    slug: 'supabase',
    name: 'Supabase',
    registrationUrl: 'https://supabase.com/dashboard/project/_/settings/api',
    description: 'Open source Firebase alternative (Postgres, Auth, Storage)',
    icon: '⚡',
    category: 'database',
    envVars: [
      { key: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Your Supabase project URL', required: true },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Supabase anonymous public key', required: true },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Full access secret key (Server only!)', required: true },
    ],
  },
  {
    slug: 'upstash',
    name: 'Upstash',
    registrationUrl: 'https://console.upstash.com/',
    description: 'Serverless Redis, Kafka, and Vector database',
    icon: '🐎',
    category: 'database',
    envVars: [
      { key: 'UPSTASH_REDIS_REST_URL', description: 'Upstash Redis REST URL', required: true },
      { key: 'UPSTASH_REDIS_REST_TOKEN', description: 'Upstash Redis REST Token', required: true },
    ],
  },

  // ── Email & Communication ─────────────────────
  {
    slug: 'resend',
    name: 'Resend',
    registrationUrl: 'https://resend.com/api-keys',
    description: 'Email API for developers',
    icon: '📧',
    category: 'email',
    envVars: [
      { key: 'RESEND_API_KEY', description: 'Your Resend API key', required: true, placeholder: 're_...' },
    ],
  },
  {
    slug: 'twilio',
    name: 'Twilio',
    registrationUrl: 'https://www.twilio.com/console',
    description: 'SMS, Voice, and Video communication',
    icon: '📱',
    category: 'other',
    envVars: [
      { key: 'TWILIO_ACCOUNT_SID', description: 'Twilio Account SID', required: true },
      { key: 'TWILIO_AUTH_TOKEN', description: 'Twilio Auth Token', required: true },
      { key: 'TWILIO_PHONE_NUMBER', description: 'Your Twilio phone number', required: true },
    ],
  },

  // ── Monitoring & Analytics ────────────────────
  {
    slug: 'sentry',
    name: 'Sentry',
    registrationUrl: 'https://sentry.io/settings/projects/',
    description: 'Error tracking and performance monitoring',
    icon: '🔍',
    category: 'monitoring',
    envVars: [
      { key: 'NEXT_PUBLIC_SENTRY_DSN', description: 'Sentry project DSN (client/server)', required: true },
    ],
  },
  {
    slug: 'posthog',
    name: 'PostHog',
    registrationUrl: 'https://app.posthog.com/project/settings',
    description: 'Open source product analytics and feature flags',
    icon: '🦔',
    category: 'analytics',
    envVars: [
      { key: 'NEXT_PUBLIC_POSTHOG_KEY', description: 'PostHog API key (client)', required: true },
      { key: 'NEXT_PUBLIC_POSTHOG_HOST', description: 'PostHog host URL', required: true, placeholder: 'https://app.posthog.com' },
    ],
  },

  // ── Deployment & CI ───────────────────────────
  {
    slug: 'vercel',
    name: 'Vercel (CI/CD)',
    registrationUrl: 'https://vercel.com/account/tokens',
    description: 'Deployment platform (API tokens for CI)',
    icon: '▲',
    category: 'infrastructure',
    envVars: [
      { key: 'VERCEL_TOKEN', description: 'Vercel API Token', required: false },
      { key: 'VERCEL_ORG_ID', description: 'Vercel Organization ID', required: false },
      { key: 'VERCEL_PROJECT_ID', description: 'Vercel Project ID', required: false },
    ],
  },
];

export const SERVICE_CATEGORIES = [
  { slug: 'llm', label: 'AI & LLM', icon: '🤖' },
  { slug: 'auth', label: 'Auth', icon: '🔐' },
  { slug: 'database', label: 'Database', icon: '💾' },
  { slug: 'payments', label: 'Payments', icon: '💳' },
  { slug: 'email', label: 'Email', icon: '📧' },
  { slug: 'monitoring', label: 'Monitoring', icon: '🔍' },
  { slug: 'analytics', label: 'Analytics', icon: '📈' },
  { slug: 'infrastructure', label: 'Infra', icon: '🏗️' },
  { slug: 'other', label: 'Other', icon: '🛠️' },
];

/** 
 * Automatically recommend services based on selected packages 
 */
export function getRecommendedServices(selectedPackages: string[], stackConfig: Record<string, string | boolean>): string[] {
  const recommended = new Set<string>();

  // Map packages to services
  if (selectedPackages.includes('stripe')) recommended.add('stripe');
  if (selectedPackages.includes('paystack')) recommended.add('paystack');
  if (selectedPackages.includes('resend')) recommended.add('resend');
  if (selectedPackages.includes('clerk')) recommended.add('clerk');
  if (selectedPackages.includes('sentry')) recommended.add('sentry');
  if (selectedPackages.includes('posthog')) recommended.add('posthog');
  if (selectedPackages.includes('supabase')) recommended.add('supabase'); // though it's usually in stack
  
  // Map stack config to services
  if (stackConfig.database === 'supabase') recommended.add('supabase');
  if (stackConfig.auth === 'clerk') recommended.add('clerk');
  if (stackConfig.deployment === 'vercel') recommended.add('vercel');

  return Array.from(recommended);
}

/** Get specific service definition */
export function getServiceDefinition(slug: string): ApiService | undefined {
  return SERVICE_LIBRARY.find((s) => s.slug === slug);
}
