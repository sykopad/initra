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
    },
    boilerplateFiles: [
      {
        path: 'src/{{middlewareFilename}}.ts',
        targetTemplate: 'nextjs',
        content: `import { clerkMiddleware } from "@clerk/nextjs/server";\n\n{{middlewareExport}} clerkMiddleware();\n\nexport const config = {\n  matcher: [\n    '/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',\n    '/(api|trpc)(.*)',\n  ],\n};`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "@clerk/nextjs": "^6.0.0"
          }
        })
      }
    ]
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
        targetTemplate: 'nextjs',
        content: `import { createBrowserClient } from '@supabase/ssr';\n\nexport const createClient = () =>\n  createBrowserClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n  );`
      },
      {
        path: 'src/lib/supabase/server.ts',
        targetTemplate: 'nextjs',
        content: `import { createServerClient } from '@supabase/ssr';\nimport { cookies } from 'next/headers';\n\nexport const createClient = async () => {\n  const cookieStore = await cookies();\n\n  return createServerClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,\n    {\n      cookies: {\n        getAll() {\n          return cookieStore.getAll();\n        },\n        setAll(cookiesToSet) {\n          try {\n            cookiesToSet.forEach(({ name, value, options }) =>\n              cookieStore.set(name, value, options)\n            );\n          } catch {\n            // The \`setAll\` method was called from a Server Component.\n            // This can be ignored if you have middleware refreshing\n            // user sessions.\n          }\n        },\n      },\n    }\n  );\n};`
      },
      {
        path: 'src/app/login/page.tsx',
        targetTemplate: 'nextjs',
        content: `import { headers } from 'next/headers';\nimport { createClient } from '@/lib/supabase/server';\nimport { redirect } from 'next/navigation';\n\nexport default async function Login(props: { searchParams: Promise<{ message: string }> }) {\n  const searchParams = await props.searchParams;\n  const signIn = async (formData: FormData) => {\n    'use server';\n    const email = formData.get('email') as string;\n    const password = formData.get('password') as string;\n    const supabase = await createClient();\n    const { error } = await supabase.auth.signInWithPassword({ email, password });\n    if (error) return redirect('/login?message=Could not authenticate user');\n    return redirect('/dashboard');\n  };\n\n  const signUp = async (formData: FormData) => {\n    'use server';\n    const origin = (await headers()).get('origin');\n    const email = formData.get('email') as string;\n    const password = formData.get('password') as string;\n    const supabase = await createClient();\n    const { error } = await supabase.auth.signUp({\n      email,\n      password,\n      options: {\n        emailRedirectTo: \`\${origin}/auth/callback\`\n      }\n    });\n    if (error) return redirect('/login?message=Could not authenticate user');\n    return redirect('/login?message=Check email to continue sign in process');\n  };\n\n  return (\n    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px', margin: '0 auto', gap: '1rem', padding: '2rem' }}>\n      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>\n        <label htmlFor="email">Email</label>\n        <input style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }} name="email" placeholder="you@example.com" required />\n        <label htmlFor="password">Password</label>\n        <input style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }} type="password" name="password" placeholder="••••••••" required />\n        <button formAction={signIn} style={{ background: '#2563eb', color: 'white', padding: '0.5rem', borderRadius: '4px' }}>Sign In</button>\n        <button formAction={signUp} style={{ background: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '4px' }}>Sign Up</button>\n        {searchParams?.message && <p style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,0,0,0.1)', textAlign: 'center' }}>{searchParams.message}</p>}\n      </form>\n    </div>\n  );\n}`
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
    boilerplateFiles: [
      {
        path: 'src/lib/redis.ts',
        content: `import { Redis } from '@upstash/redis';\n\nexport const redis = new Redis({\n  url: process.env.UPSTASH_REDIS_REST_URL!,\n  token: process.env.UPSTASH_REDIS_REST_TOKEN!,\n});`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "@upstash/redis": "^1.28.0"
          }
        })
      }
    ]
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
    boilerplateFiles: [
      {
        path: 'src/lib/resend.ts',
        content: `import { Resend } from 'resend';\n\nexport const resend = new Resend(process.env.RESEND_API_KEY!);`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "resend": "^4.0.0"
          }
        })
      }
    ]
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
    boilerplateFiles: [
      {
        path: 'sentry.client.config.ts',
        content: `import * as Sentry from '@sentry/nextjs';\n\nSentry.init({\n  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,\n  tracesSampleRate: 1,\n  debug: false,\n});`
      },
      {
        path: 'sentry.server.config.ts',
        content: `import * as Sentry from '@sentry/nextjs';\n\nSentry.init({\n  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,\n  tracesSampleRate: 1,\n  debug: false,\n});`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "@sentry/nextjs": "^8.0.0"
          }
        })
      }
    ]
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
    boilerplateFiles: [
      {
        path: 'src/providers/posthog-provider.tsx',
        targetTemplate: 'nextjs',
        content: `'use client';\nimport posthog from 'posthog-js';\nimport { PostHogProvider } from 'posthog-js/react';\nimport { useEffect } from 'react';\n\nexport function CSPostHogProvider({ children }: { children: React.ReactNode }) {\n  useEffect(() => {\n    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {\n      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,\n      person_profiles: 'identified_only',\n    })\n  }, [])\n  return <PostHogProvider client={posthog}>{children}</PostHogProvider>\n}`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "posthog-js": "^1.100.0"
          }
        })
      }
    ]
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

  // ── SaaS Platforms ────────────────────────────
  {
    slug: 'freshdesk',
    name: 'Freshdesk',
    registrationUrl: 'https://freshdesk.com/signup',
    description: 'Customer Support Helpdesk and Ticketing',
    icon: '🎧',
    category: 'saas',
    envVars: [
      { key: 'FRESHDESK_API_KEY', description: 'Freshdesk API Key', required: true },
      { key: 'FRESHDESK_DOMAIN', description: 'Freshdesk Domain', required: true, placeholder: 'yourcompany.freshdesk.com' }
    ],
  },
  {
    slug: 'google-workspace',
    name: 'Google Workspace',
    registrationUrl: 'https://workspace.google.com/',
    description: 'Professional Email and Collaboration (G Suite)',
    icon: '📧',
    category: 'saas',
    envVars: [
      { key: 'GOOGLE_CLIENT_ID', description: 'Google OAuth Client ID', required: false },
      { key: 'GOOGLE_CLIENT_SECRET', description: 'Google OAuth Client Secret', required: false }
    ],
  },
  {
    slug: 'zoho',
    name: 'Zoho',
    registrationUrl: 'https://www.zoho.com/',
    description: 'Suite for Transactions, Invoicing, and Business Apps',
    icon: '💼',
    category: 'saas',
    envVars: [
      { key: 'ZOHO_CLIENT_ID', description: 'Zoho API Client ID', required: true },
      { key: 'ZOHO_CLIENT_SECRET', description: 'Zoho API Client Secret', required: true }
    ],
  },
  {
    slug: 'salesforce',
    name: 'Salesforce',
    registrationUrl: 'https://developer.salesforce.com/signup',
    description: 'Enterprise Customer Relationship Management (CRM)',
    icon: '☁️',
    category: 'saas',
    envVars: [
      { key: 'SALESFORCE_CLIENT_ID', description: 'Salesforce Connected App Client ID', required: true },
      { key: 'SALESFORCE_CLIENT_SECRET', description: 'Salesforce Connected App Client Secret', required: true }
    ],
  },

  // ── Content Management (CMS) ──────────────────
  {
    slug: 'sanity',
    name: 'Sanity',
    registrationUrl: 'https://www.sanity.io/',
    description: 'Structured content platform and headless CMS',
    icon: '📝',
    category: 'cms',
    envVars: [
      { key: 'NEXT_PUBLIC_SANITY_PROJECT_ID', description: 'Sanity Project ID', required: true },
      { key: 'NEXT_PUBLIC_SANITY_DATASET', description: 'Sanity Dataset (e.g. production)', required: true, placeholder: 'production' },
      { key: 'SANITY_API_TOKEN', description: 'Sanity API Token (Server)', required: false }
    ],
    boilerplateFiles: [
      {
        path: 'sanity.config.ts',
        content: `import { defineConfig } from 'sanity';\nimport { structureTool } from 'sanity/structure';\n\nexport default defineConfig({\n  name: 'default',\n  title: 'Sanity Studio',\n  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,\n  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,\n  plugins: [structureTool()],\n  schema: {\n    types: [],\n  },\n});`
      },
      {
        path: 'sanity.cli.ts',
        content: `import { defineCliConfig } from 'sanity/cli';\n\nexport default defineCliConfig({\n  api: {\n    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,\n    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,\n  }\n});`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "next-sanity": "^9.0.0",
            "sanity": "^3.0.0"
          }
        })
      }
    ],
  },
  {
    slug: 'contentful',
    name: 'Contentful',
    registrationUrl: 'https://www.contentful.com/',
    description: 'Enterprise headless CMS',
    icon: '📋',
    category: 'cms',
    envVars: [
      { key: 'CONTENTFUL_SPACE_ID', description: 'Contentful Space ID', required: true },
      { key: 'CONTENTFUL_ACCESS_TOKEN', description: 'Contentful Delivery API Token', required: true },
      { key: 'CONTENTFUL_PREVIEW_ACCESS_TOKEN', description: 'Contentful Preview API Token', required: false }
    ],
    boilerplateFiles: [
      {
        path: 'src/lib/contentful.ts',
        content: `import { createClient } from 'contentful';\n\nexport const contentfulClient = createClient({\n  space: process.env.CONTENTFUL_SPACE_ID!,\n  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,\n});`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "contentful": "^10.0.0"
          }
        })
      }
    ]
  },

  // ── Search & Discovery ────────────────────────
  {
    slug: 'algolia',
    name: 'Algolia',
    registrationUrl: 'https://www.algolia.com/',
    description: 'Blazing fast search and discovery API',
    icon: '🔍',
    category: 'search',
    envVars: [
      { key: 'NEXT_PUBLIC_ALGOLIA_APP_ID', description: 'Algolia Application ID', required: true },
      { key: 'NEXT_PUBLIC_ALGOLIA_SEARCH_KEY', description: 'Algolia Search-only API Key', required: true },
      { key: 'ALGOLIA_ADMIN_KEY', description: 'Algolia Admin API Key (Server only)', required: true }
    ],
    boilerplateFiles: [
      {
        path: 'src/lib/algolia.ts',
        content: `import algoliasearch from 'algoliasearch';\n\nexport const searchClient = algoliasearch(\n  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,\n  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!\n);`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "algoliasearch": "^5.0.0",
            "react-instantsearch": "^7.0.0"
          }
        })
      }
    ],
  },
  {
    slug: 'meilisearch',
    name: 'Meilisearch',
    registrationUrl: 'https://www.meilisearch.com/',
    description: 'Lightning fast open-source search engine',
    icon: '⚡',
    category: 'search',
    envVars: [
      { key: 'NEXT_PUBLIC_MEILISEARCH_HOST', description: 'Meilisearch Host URL', required: true },
      { key: 'NEXT_PUBLIC_MEILISEARCH_API_KEY', description: 'Meilisearch Search Key', required: true },
      { key: 'MEILISEARCH_MASTER_KEY', description: 'Meilisearch Master Key (Server only)', required: true }
    ],
    boilerplateFiles: [
      {
        path: 'src/lib/meilisearch.ts',
        content: `import { MeiliSearch } from 'meilisearch';\n\nexport const meilisearch = new MeiliSearch({\n  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST!,\n  apiKey: process.env.MEILISEARCH_MASTER_KEY!,\n});`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "meilisearch": "^0.38.0"
          }
        })
      }
    ]
  },

  // ── Workflow Automation ───────────────────────
  {
    slug: 'zapier',
    name: 'Zapier',
    registrationUrl: 'https://zapier.com/',
    description: 'Automation platform linking 5000+ apps',
    icon: '⚡',
    category: 'automation',
    envVars: [
      { key: 'ZAPIER_WEBHOOK_URL', description: 'Zapier Webhook URL for catching events', required: true }
    ],
  },
  {
    slug: 'make',
    name: 'Make (Integromat)',
    registrationUrl: 'https://www.make.com/',
    description: 'Visual workflow automation platform',
    icon: '🔗',
    category: 'automation',
    envVars: [
      { key: 'MAKE_WEBHOOK_URL', description: 'Make Webhook URL for triggering scenarios', required: true }
    ],
  },

  // ── Advanced Database & Storage ───────────────
  {
    slug: 'neon',
    name: 'Neon',
    registrationUrl: 'https://neon.tech/',
    description: 'Serverless Postgres built for the cloud',
    icon: '🐘',
    category: 'database',
    envVars: [
      { key: 'DATABASE_URL', description: 'Neon Postgres Connection String', required: true, placeholder: 'postgresql://...' }
    ],
  },
  {
    slug: 'mongodb-atlas',
    name: 'MongoDB Atlas',
    registrationUrl: 'https://www.mongodb.com/cloud/atlas',
    description: 'Managed MongoDB NoSQL database',
    icon: '🍃',
    category: 'database',
    envVars: [
      { key: 'MONGODB_URI', description: 'MongoDB Connection String', required: true, placeholder: 'mongodb+srv://...' }
    ],
  },
  {
    slug: 'aws-s3',
    name: 'AWS S3',
    registrationUrl: 'https://aws.amazon.com/s3/',
    description: 'Highly durable cloud object storage',
    icon: '🪣',
    category: 'storage',
    envVars: [
      { key: 'AWS_ACCESS_KEY_ID', description: 'AWS Access Key', required: true },
      { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS Secret Key', required: true },
      { key: 'AWS_REGION', description: 'AWS Region', required: true, placeholder: 'us-east-1' },
      { key: 'AWS_S3_BUCKET_NAME', description: 'S3 Bucket Name', required: true }
    ],
    boilerplateFiles: [
      {
        path: 'src/lib/s3.ts',
        content: `import { S3Client } from '@aws-sdk/client-s3';\n\nexport const s3 = new S3Client({\n  region: process.env.AWS_REGION!,\n  credentials: {\n    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,\n    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,\n  }\n});`
      },
      {
        path: 'package.json',
        mergeType: 'package-json',
        content: JSON.stringify({
          dependencies: {
            "@aws-sdk/client-s3": "^3.0.0"
          }
        })
      }
    ]
  },

  // ── Notifications & Communication ─────────────
  {
    slug: 'slack',
    name: 'Slack',
    registrationUrl: 'https://api.slack.com/',
    description: 'Webhooks for internal team notifications',
    icon: '💬',
    category: 'notifications',
    envVars: [
      { key: 'SLACK_WEBHOOK_URL', description: 'Slack Incoming Webhook URL', required: true }
    ],
  },
  {
    slug: 'discord',
    name: 'Discord',
    registrationUrl: 'https://discord.com/developers/applications',
    description: 'Bots and webhooks for communities',
    icon: '🎮',
    category: 'notifications',
    envVars: [
      { key: 'DISCORD_WEBHOOK_URL', description: 'Discord Webhook URL', required: true }
    ],
  },
  {
    slug: 'pusher',
    name: 'Pusher',
    registrationUrl: 'https://pusher.com/',
    description: 'Realtime WebSockets for chat and sync',
    icon: '🔌',
    category: 'notifications',
    envVars: [
      { key: 'PUSHER_APP_ID', description: 'Pusher App ID', required: true },
      { key: 'NEXT_PUBLIC_PUSHER_KEY', description: 'Pusher Key', required: true },
      { key: 'PUSHER_SECRET', description: 'Pusher Secret', required: true },
      { key: 'NEXT_PUBLIC_PUSHER_CLUSTER', description: 'Pusher Cluster', required: true }
    ],
  },

  // ── Marketing & Mail ──────────────────────────
  {
    slug: 'hubspot',
    name: 'HubSpot',
    registrationUrl: 'https://developers.hubspot.com/',
    description: 'Inbound marketing, CRM, and sales platform',
    icon: '🎯',
    category: 'saas',
    envVars: [
      { key: 'HUBSPOT_ACCESS_TOKEN', description: 'HubSpot Private App Access Token', required: true }
    ],
  },
  {
    slug: 'mailchimp',
    name: 'Mailchimp',
    registrationUrl: 'https://mailchimp.com/developer/',
    description: 'Email marketing and newsletters',
    icon: '🐵',
    category: 'saas',
    envVars: [
      { key: 'MAILCHIMP_API_KEY', description: 'Mailchimp API Key', required: true },
      { key: 'MAILCHIMP_SERVER_PREFIX', description: 'Mailchimp Server Prefix (e.g. us1)', required: true }
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
  { slug: 'saas', label: 'SaaS', icon: '☁️' },
  { slug: 'cms', label: 'CMS', icon: '📝' },
  { slug: 'search', label: 'Search', icon: '🔍' },
  { slug: 'automation', label: 'Automation', icon: '⚡' },
  { slug: 'storage', label: 'Storage', icon: '🪣' },
  { slug: 'notifications', label: 'Alerts', icon: '💬' },
  { slug: 'infrastructure', label: 'Infra', icon: '🏗️' },
  { slug: 'other', label: 'Other', icon: '🛠️' },
];

/** 
 * Automatically recommend services based on selected packages 
 */
export function getRecommendedServices(selectedPackages: string[], stackConfig: Record<string, string | boolean | string[] | undefined>): string[] {
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
