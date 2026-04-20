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
    documentationUrl: 'https://platform.openai.com/docs/introduction',
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
    documentationUrl: 'https://clerk.com/docs',
    description: 'Modern user management and authentication',
    icon: '👤',
    category: 'auth',
    envVars: [
      { key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', description: 'Clerk publishable key (client)', required: true, placeholder: 'pk_test_...' },
      { key: 'CLERK_SECRET_KEY', description: 'Clerk secret key (server)', required: true, placeholder: 'sk_test_...' },
    ],
    compatibility: {
      frameworks: ['nextjs', 'nuxt'],
    }
  },

  // ── Payments ──────────────────────────────────
  {
    slug: 'stripe',
    name: 'Stripe',
    registrationUrl: 'https://dashboard.stripe.com/apikeys',
    documentationUrl: 'https://docs.stripe.com/',
    description: 'Global payment infrastructure',
    icon: '💳',
    category: 'payments',
    envVars: [
      { key: 'STRIPE_SECRET_KEY', description: 'Stripe secret API key', required: true, placeholder: 'sk_test_...' },
      { key: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook signing secret', required: false, placeholder: 'whsec_...' },
      { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', description: 'Stripe publishable key (client)', required: true, placeholder: 'pk_test_...' },
    ],
    boilerplateFiles: [
      {
        path: 'src/lib/stripe.ts',
        content: `import Stripe from 'stripe';\n\nexport const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {\n  apiVersion: '2024-11-20.acacia',\n  typescript: true,\n});`
      },
      {
        path: 'src/app/api/webhooks/stripe/route.ts',
        content: `import { headers } from 'next/headers';\nimport { NextResponse } from 'next/server';\nimport { stripe } from '@/lib/stripe';\n\nexport async function POST(req: Request) {\n  const body = await req.text();\n  const signature = (await headers()).get('stripe-signature') as string;\n\n  let event;\n\n  try {\n    event = stripe.webhooks.constructEvent(\n      body,\n      signature,\n      process.env.STRIPE_WEBHOOK_SECRET!\n    );\n  } catch (err: any) {\n    return new NextResponse(\`Webhook Error: \${err.message}\`, { status: 400 });\n  }\n\n  // Handle the event\n  switch (event.type) {\n    case 'checkout.session.completed':\n      const session = event.data.object;\n      // Fulfill the order\n      break;\n    default:\n      console.log(\`Unhandled event type \${event.type}\`);\n  }\n\n  return new NextResponse(null, { status: 200 });\n}`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "stripe": "^17.4.0",
            "@stripe/stripe-js": "^5.2.0"
          }
        })
      }
    ]
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
    documentationUrl: 'https://supabase.com/docs',
    description: 'Open source Firebase alternative (Postgres, Auth, Storage)',
    icon: '⚡',
    category: 'database',
    envVars: [
      { key: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Your Supabase project URL', required: true },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Supabase anonymous public key', required: true },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Full access secret key (Server only!)', required: true },
    ],
    boilerplateFiles: [
      {
        path: 'src/lib/supabase/client.ts',
        content: `import { createBrowserClient } from '@supabase/ssr';\n\nexport const createClient = () =>\n  createBrowserClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n  );`
      },
      {
        path: 'src/lib/supabase/server.ts',
        content: `import { createServerClient } from '@supabase/ssr';\nimport { cookies } from 'next/headers';\n\nexport const createClient = async () => {\n  const cookieStore = await cookies();\n\n  return createServerClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,\n    {\n      cookies: {\n        getAll() {\n          return cookieStore.getAll();\n        },\n        setAll(cookiesToSet) {\n          try {\n            cookiesToSet.forEach(({ name, value, options }) =>\n              cookieStore.set(name, value, options)\n            );\n          } catch {\n            // The \`setAll\` method was called from a Server Component.\n            // This can be ignored if you have middleware refreshing\n            // user sessions.\n          }\n        },\n      },\n    }\n  );\n};`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "@supabase/ssr": "^0.5.2",
            "@supabase/supabase-js": "^2.46.1"
          }
        })
      }
    ]
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
    documentationUrl: 'https://resend.com/docs',
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
    documentationUrl: 'https://docs.sentry.io/',
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
