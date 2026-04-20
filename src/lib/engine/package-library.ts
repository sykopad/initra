// =============================================
// Initra — Package Library Registry
// 50+ common packages across all 6 templates
// =============================================

import type { PackageDefinition, PackageCategoryMeta } from './types';

export const PACKAGE_LIBRARY: PackageDefinition[] = [

  // ── Data Fetching ─────────────────────────────

  {
    slug: 'tanstack-query',
    name: 'TanStack Query',
    category: 'data-fetching',
    icon: '🔄',
    description: 'Powerful async state management and data fetching for React',
    language: 'typescript',
    npmPackage: '@tanstack/react-query',
    compatibleTemplates: ['nextjs', 'react-native', 'nuxt'],
    documentationUrls: ['https://tanstack.com/query/latest/docs/framework/react/overview'],
    knowledge: {
      installCommand: 'npm install @tanstack/react-query @tanstack/react-query-devtools',
      setupSnippet: `// app/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}`,
      usageSnippet: `// In a Client Component
const { data, isLoading, error } = useQuery({
  queryKey: ['projects', userId],
  queryFn: () => api.getProjects(userId),
});

// Mutation
const { mutate } = useMutation({
  mutationFn: api.createProject,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
});`,
      conventions: [
        'Wrap queryKey in an array — always include dependent params: `[\'projects\', userId]`',
        'Use `queryClient.invalidateQueries()` after mutations, not manual cache updates',
        'Set `staleTime` for data that doesn\'t change often — avoids unnecessary refetches',
        'Use `enabled: false` to prevent automatic firing when params are not ready',
      ],
      antiPatterns: [
        'NEVER use `useEffect` + `useState` for data fetching if TanStack Query is installed',
        'NEVER share a single QueryClient across requests in SSR — create one per request',
      ],
    },
  },

  {
    slug: 'swr',
    name: 'SWR',
    category: 'data-fetching',
    icon: '🔁',
    description: 'React hooks for remote data fetching with stale-while-revalidate strategy',
    language: 'typescript',
    npmPackage: 'swr',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://swr.vercel.app/docs/getting-started'],
    knowledge: {
      installCommand: 'npm install swr',
      usageSnippet: `import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;
  return <div>{data.name}</div>;
}`,
      conventions: [
        'Define a global fetcher and pass it to `SWRConfig` at the root',
        'Use `mutate()` to update the cache after a mutation',
      ],
    },
  },

  {
    slug: 'axios',
    name: 'Axios',
    category: 'data-fetching',
    icon: '📡',
    description: 'Promise-based HTTP client with interceptors and automatic JSON parsing',
    language: 'typescript',
    npmPackage: 'axios',
    compatibleTemplates: ['nextjs', 'react-native', 'express', 'nuxt'],
    documentationUrls: ['https://axios-http.com/docs/intro'],
    knowledge: {
      installCommand: 'npm install axios',
      setupSnippet: `// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) { /* redirect to login */ }
    return Promise.reject(error);
  }
);`,
      conventions: [
        'Create a single Axios instance — do not use the default `axios` import in components',
        'Handle errors in interceptors for global cases (401, 500), locally for specific cases',
        'Use `axios.CancelToken` or `AbortController` for cancellable requests',
      ],
    },
  },

  {
    slug: 'trpc',
    name: 'tRPC',
    category: 'data-fetching',
    icon: '🔗',
    description: 'End-to-end type-safe APIs without code generation or schemas',
    language: 'typescript',
    npmPackage: '@trpc/server @trpc/client @trpc/next',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://trpc.io/docs/getting-started'],
    knowledge: {
      installCommand: 'npm install @trpc/server @trpc/client @trpc/next @tanstack/react-query',
      setupSnippet: `// server/api/trpc.ts
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

// server/api/routers/project.ts
export const projectRouter = router({
  getAll: publicProcedure.query(async () => {
    return db.projects.findMany();
  }),
  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return db.projects.create({ data: input });
    }),
});`,
      conventions: [
        'Define all routers in `server/api/routers/` — one file per domain',
        'Use `protectedProcedure` for auth-guarded routes',
        'Validate all inputs with Zod schemas on procedures',
      ],
      antiPatterns: [
        'NEVER use tRPC alongside REST routes for the same resource — pick one pattern',
      ],
    },
  },

  // ── Forms & Validation ────────────────────────

  {
    slug: 'react-hook-form',
    name: 'React Hook Form',
    category: 'forms-validation',
    icon: '📝',
    description: 'Performant, flexible forms with easy validation',
    language: 'typescript',
    npmPackage: 'react-hook-form',
    compatibleTemplates: ['nextjs', 'react-native'],
    documentationUrls: ['https://react-hook-form.com/get-started'],
    knowledge: {
      installCommand: 'npm install react-hook-form @hookform/resolvers',
      usageSnippet: `"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // data is fully typed and validated
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
  );
}`,
      conventions: [
        'Always pair with Zod via `@hookform/resolvers/zod` — avoids duplicate validation logic',
        'Use `formState.errors` for field-level errors, `formState.isSubmitting` for loading state',
        'Use `Controller` for custom/third-party inputs (date pickers, selects)',
      ],
      antiPatterns: [
        'NEVER use `useState` for each form field — React Hook Form handles this efficiently',
        'NEVER call `setValue` for every keystroke — use `register` instead',
      ],
    },
  },

  {
    slug: 'zod',
    name: 'Zod',
    category: 'forms-validation',
    icon: '🛡️',
    description: 'TypeScript-first schema validation with static type inference',
    language: 'typescript',
    npmPackage: 'zod',
    compatibleTemplates: ['nextjs', 'react-native', 'express'],
    documentationUrls: ['https://zod.dev/'],
    knowledge: {
      installCommand: 'npm install zod',
      usageSnippet: `import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  createdAt: z.coerce.date(),
});

// Infer TypeScript type
type User = z.infer<typeof UserSchema>;

// Parse (throws on invalid)
const user = UserSchema.parse(rawData);

// Safe parse (returns result object)
const result = UserSchema.safeParse(rawData);
if (!result.success) {
  console.error(result.error.issues);
}`,
      conventions: [
        'Export schemas and their inferred types from the same file',
        'Use `.safeParse()` for user input validation — never `.parse()` in API handlers',
        'Colocate schemas with their route/component — in `schemas/` or alongside the file',
        'Use `z.infer<typeof Schema>` for TypeScript types — never duplicate type definitions',
      ],
    },
  },

  // ── UI Components ─────────────────────────────

  {
    slug: 'shadcn-ui',
    name: 'shadcn/ui',
    category: 'ui-components',
    icon: '🎨',
    description: 'Beautifully designed, accessible, copy-paste component library built on Radix UI',
    language: 'typescript',
    npmPackage: 'shadcn/ui (CLI)',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://ui.shadcn.com/docs'],
    knowledge: {
      installCommand: 'npx shadcn@latest init',
      setupSnippet: `# Initialize (run once):
npx shadcn@latest init

# Add individual components as needed:
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form`,
      usageSnippet: `import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function MyDialog() {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hello</DialogTitle>
        </DialogHeader>
        <Button variant="outline">Cancel</Button>
        <Button>Confirm</Button>
      </DialogContent>
    </Dialog>
  );
}`,
      conventions: [
        'Components live in `src/components/ui/` — DO NOT edit them directly; extend via className',
        'Use `cn()` utility for conditional class merging',
        'Add components via CLI (`npx shadcn add X`) — never copy-paste and forget',
        'Use the `asChild` prop to merge behavior into child elements',
      ],
      antiPatterns: [
        'NEVER modify files in `components/ui/` — they get overwritten on re-add',
        'NEVER use shadcn alongside another component library for the same use cases',
      ],
    },
  },

  {
    slug: 'radix-ui',
    name: 'Radix UI',
    category: 'ui-components',
    icon: '⭕',
    description: 'Unstyled, accessible UI primitives for building design systems',
    language: 'typescript',
    npmPackage: '@radix-ui/react-*',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://www.radix-ui.com/primitives/docs/overview/introduction'],
    knowledge: {
      installCommand: 'npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu',
      conventions: [
        'Radix components are unstyled — apply your own CSS or Tailwind classes',
        'Use `asChild` to compose Radix behavior with your own elements',
        'Always handle keyboard navigation — Radix provides it, but verify with your styling',
      ],
    },
  },

  {
    slug: 'mantine',
    name: 'Mantine',
    category: 'ui-components',
    icon: '💎',
    description: 'Full-featured React component library with 100+ components',
    language: 'typescript',
    npmPackage: '@mantine/core @mantine/hooks',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://mantine.dev/getting-started/'],
    knowledge: {
      installCommand: 'npm install @mantine/core @mantine/hooks @mantine/form',
      setupSnippet: `// app/layout.tsx
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}`,
      conventions: [
        'Import `@mantine/core/styles.css` in the root layout',
        'Use `useMantineTheme()` for theme access in components',
        'Use `@mantine/form` instead of React Hook Form if already using Mantine',
      ],
    },
  },

  // ── Animation ─────────────────────────────────

  {
    slug: 'framer-motion',
    name: 'Framer Motion',
    category: 'animation',
    icon: '✨',
    description: 'Production-ready animation library for React',
    language: 'typescript',
    npmPackage: 'framer-motion',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://www.framer.com/motion/introduction/'],
    knowledge: {
      installCommand: 'npm install framer-motion',
      usageSnippet: `import { motion, AnimatePresence } from 'framer-motion';

// Basic animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Page transition with AnimatePresence
<AnimatePresence mode="wait">
  <motion.div key={pathname} initial="hidden" animate="enter" exit="exit" variants={pageVariants}>
    {children}
  </motion.div>
</AnimatePresence>`,
      conventions: [
        'Use `variants` object to define animation states for reusability',
        'Use `whileHover` and `whileTap` for interactive feedback',
        'Wrap conditional renders in `<AnimatePresence>` for exit animations',
        'Use `layoutId` for shared element transitions between routes',
      ],
      antiPatterns: [
        'NEVER animate layout-affecting properties (width/height) — use `layout` prop instead',
        'NEVER use Framer Motion for simple CSS-achievable transitions — keep it for complex cases',
      ],
    },
  },

  {
    slug: 'rn-reanimated',
    name: 'React Native Reanimated',
    category: 'animation',
    icon: '⚡',
    description: 'Smooth 60fps animations running on the native thread',
    language: 'typescript',
    npmPackage: 'react-native-reanimated',
    compatibleTemplates: ['react-native'],
    documentationUrls: ['https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/'],
    knowledge: {
      installCommand: 'npx expo install react-native-reanimated',
      conventions: [
        'Add `react-native-reanimated/plugin` to `babel.config.js` plugins — required',
        'Use `useSharedValue` and `useAnimatedStyle` for performance-critical animations',
        'Use `withSpring`, `withTiming`, `withSequence` for animation composition',
        'Run animations on the UI thread — avoid JS thread for smooth 60fps',
      ],
    },
  },

  // ── Authentication ────────────────────────────

  {
    slug: 'nextauth',
    name: 'Auth.js (NextAuth)',
    category: 'auth',
    icon: '🔐',
    description: 'Authentication for Next.js with support for 50+ providers',
    language: 'typescript',
    npmPackage: 'next-auth',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://next-auth.js.org/getting-started/introduction'],
    knowledge: {
      installCommand: 'npm install next-auth',
      setupSnippet: `// auth.ts (project root)
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, token }) {
      session.user.id = token.sub!;
      return session;
    },
  },
});

// app/api/auth/[...nextauth]/route.ts
export { GET, POST } from "@/auth";`,
      conventions: [
        'Use `auth()` from `@/auth` in Server Components — never `getServerSession()` (deprecated)',
        'Use `SessionProvider` only in Client Component subtrees that need `useSession()`',
        'Store the `AUTH_SECRET` env var — required in production',
        'Use `middleware.ts` with `auth` export to protect routes declaratively',
      ],
    },
  },

  {
    slug: 'clerk',
    name: 'Clerk',
    category: 'auth',
    icon: '👤',
    description: 'Complete user management and authentication platform',
    language: 'typescript',
    npmPackage: '@clerk/nextjs',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://clerk.com/docs/quickstarts/nextjs'],
    knowledge: {
      installCommand: 'npm install @clerk/nextjs',
      setupSnippet: `// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect();
});

export const config = { matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'] };`,
      conventions: [
        'Use `clerkMiddleware` in `middleware.ts` for route protection',
        'Use `auth()` server-side, `useAuth()` client-side',
        'Use `<ClerkProvider>` at the root layout',
        'Use `currentUser()` in Server Actions and Route Handlers',
      ],
    },
  },

  // ── Payments ──────────────────────────────────

  {
    slug: 'stripe',
    name: 'Stripe',
    category: 'payments',
    icon: '💳',
    description: 'Complete payment infrastructure for the internet',
    language: 'typescript',
    npmPackage: 'stripe @stripe/stripe-js',
    compatibleTemplates: ['nextjs', 'express', 'nuxt'],
    documentationUrls: ['https://docs.stripe.com/development'],
    knowledge: {
      installCommand: 'npm install stripe @stripe/stripe-js',
      setupSnippet: `// lib/stripe.ts — server-side singleton
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// app/api/checkout/route.ts
export async function POST(req: Request) {
  const { priceId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: \`\${process.env.NEXT_PUBLIC_URL}/success\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/pricing\`,
  });

  return Response.json({ url: session.url });
}`,
      conventions: [
        'NEVER use the secret key client-side — only use `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` on the client',
        'Always verify webhook signatures with `stripe.webhooks.constructEvent()`',
        'Use Stripe CLI for local webhook testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`',
        'Store `stripeCustomerId` on your user record — do not call `customers.create()` repeatedly',
      ],
      antiPatterns: [
        'NEVER fulfill orders client-side — always verify payment in a webhook handler',
        'NEVER hardcode price IDs — store them in environment variables',
      ],
    },
  },

  {
    slug: 'paystack',
    name: 'Paystack',
    category: 'payments',
    icon: '💰',
    description: 'Modern payment processing for Africa',
    language: 'typescript',
    npmPackage: 'paystack',
    compatibleTemplates: ['nextjs', 'express'],
    documentationUrls: ['https://paystack.com/docs/api/'],
    knowledge: {
      installCommand: 'npm install paystack',
      setupSnippet: `// lib/paystack.ts
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const BASE_URL = 'https://api.paystack.co';

export async function initializePayment(email: string, amount: number, metadata?: object) {
  const res = await fetch(\`\${BASE_URL}/transaction/initialize\`, {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${PAYSTACK_SECRET}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, amount: amount * 100, metadata }), // amount in kobo
  });
  return res.json();
}

export async function verifyPayment(reference: string) {
  const res = await fetch(\`\${BASE_URL}/transaction/verify/\${reference}\`, {
    headers: { Authorization: \`Bearer \${PAYSTACK_SECRET}\` },
  });
  return res.json();
}`,
      conventions: [
        'Amount is in the smallest currency unit (kobo for NGN, pesewas for GHS)',
        'Always verify payment server-side before fulfilling orders',
        'Verify webhook signature using `x-paystack-signature` header',
      ],
    },
  },

  // ── Email ─────────────────────────────────────

  {
    slug: 'resend',
    name: 'Resend',
    category: 'email',
    icon: '📧',
    description: 'Email API built for developers with React Email support',
    language: 'typescript',
    npmPackage: 'resend react-email @react-email/components',
    compatibleTemplates: ['nextjs', 'express', 'nuxt'],
    documentationUrls: ['https://resend.com/docs/introduction'],
    knowledge: {
      installCommand: 'npm install resend react-email @react-email/components',
      setupSnippet: `// lib/email.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY!);

// app/api/send-welcome/route.ts
import { WelcomeEmail } from '@/emails/welcome';

export async function POST(req: Request) {
  const { email, name } = await req.json();

  const { data, error } = await resend.emails.send({
    from: 'Initra <noreply@yourdomain.com>',
    to: [email],
    subject: 'Welcome to Initra!',
    react: WelcomeEmail({ name }),
  });

  if (error) return Response.json({ error }, { status: 500 });
  return Response.json({ id: data?.id });
}`,
      conventions: [
        'Define email templates as React components in `emails/` directory',
        'Test emails locally with `npx react-email dev`',
        'Use a verified domain for the `from` address in production',
      ],
    },
  },

  // ── File Upload ───────────────────────────────

  {
    slug: 'uploadthing',
    name: 'UploadThing',
    category: 'file-upload',
    icon: '📁',
    description: 'Simple, type-safe file uploads for Next.js',
    language: 'typescript',
    npmPackage: 'uploadthing @uploadthing/react',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://docs.uploadthing.com/getting-started/appdir'],
    knowledge: {
      installCommand: 'npm install uploadthing @uploadthing/react',
      setupSnippet: `// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Auth check here — throw if not authed
      return { userId: "user_id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;`,
      conventions: [
        'Define file routes in `app/api/uploadthing/core.ts` and mount in `route.ts`',
        'Always add auth middleware to routes — never allow anonymous uploads in production',
        'Store the returned `url` in your database, not the file itself',
      ],
    },
  },

  // ── Monitoring ────────────────────────────────

  {
    slug: 'sentry',
    name: 'Sentry',
    category: 'monitoring',
    icon: '🔍',
    description: 'Application monitoring, error tracking, and performance monitoring',
    language: 'typescript',
    npmPackage: '@sentry/nextjs',
    compatibleTemplates: ['nextjs', 'express', 'react-native', 'nuxt'],
    documentationUrls: ['https://docs.sentry.io/'],
    knowledge: {
      installCommand: 'npx @sentry/wizard@latest -i nextjs',
      setupSnippet: `// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});`,
      conventions: [
        'Use the wizard (`npx @sentry/wizard`) — it configures instrumentation automatically',
        'Capture specific errors with `Sentry.captureException(error)` in catch blocks',
        'Use `Sentry.setUser({ id, email })` after login to associate errors with users',
        'Set `tracesSampleRate` to `0.1` in production to control costs',
      ],
    },
  },

  {
    slug: 'posthog',
    name: 'PostHog',
    category: 'monitoring',
    icon: '🦔',
    description: 'Open-source product analytics with feature flags and session recording',
    language: 'typescript',
    npmPackage: 'posthog-js posthog-node',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://posthog.com/docs/quickstart/nextjs'],
    knowledge: {
      installCommand: 'npm install posthog-js posthog-node',
      setupSnippet: `// app/providers.tsx
"use client";
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false, // handle manually for Next.js
    });
  }, []);
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}`,
      conventions: [
        'Use `posthog.capture()` for custom events, not just page views',
        'Use `usePostHog()` hook in client components to access the client',
        'Use `posthog-node` for server-side event capture in Route Handlers',
      ],
    },
  },

  // ── Charts ────────────────────────────────────

  {
    slug: 'recharts',
    name: 'Recharts',
    category: 'charts',
    icon: '📊',
    description: 'Composable charting library built on React and D3',
    language: 'typescript',
    npmPackage: 'recharts',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://recharts.org/en-US/guide/getting-started'],
    knowledge: {
      installCommand: 'npm install recharts',
      usageSnippet: `"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}`,
      conventions: [
        'Always wrap in `<ResponsiveContainer>` — never use fixed pixel dimensions',
        'Recharts components must be Client Components — add `"use client"`',
        'Use `CustomTooltip` for formatted tooltip content',
      ],
    },
  },

  // ── Real-time ─────────────────────────────────

  {
    slug: 'pusher',
    name: 'Pusher',
    category: 'realtime',
    icon: '⚡',
    description: 'Hosted WebSocket service for real-time features',
    language: 'typescript',
    npmPackage: 'pusher pusher-js',
    compatibleTemplates: ['nextjs', 'express'],
    documentationUrls: ['https://pusher.com/docs/channels/getting_started/javascript/'],
    knowledge: {
      installCommand: 'npm install pusher pusher-js',
      setupSnippet: `// lib/pusher.ts (server)
import Pusher from 'pusher';
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// lib/pusher-client.ts (client)
import PusherJS from 'pusher-js';
export const pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});`,
      conventions: [
        'Trigger events server-side only — never from the client directly',
        'Subscribe to channels in `useEffect` and unsubscribe on cleanup',
        'Use private channels (`private-`) for authenticated events',
      ],
    },
  },

  // ── Background Jobs ───────────────────────────

  {
    slug: 'inngest',
    name: 'Inngest',
    category: 'background-jobs',
    icon: '⚙️',
    description: 'Serverless background jobs, workflows, and scheduled functions',
    language: 'typescript',
    npmPackage: 'inngest',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://www.inngest.com/docs'],
    knowledge: {
      installCommand: 'npm install inngest',
      setupSnippet: `// inngest/client.ts
import { Inngest } from "inngest";
export const inngest = new Inngest({ id: "my-app" });

// inngest/functions/send-welcome.ts
export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email" },
  { event: "user/signed-up" },
  async ({ event, step }) => {
    const user = await step.run("fetch-user", () => db.users.findById(event.data.userId));
    await step.run("send-email", () => resend.emails.send({ to: user.email, ... }));
    await step.sleep("wait-1-day", "1d");
    await step.run("send-followup", () => resend.emails.send({ ... }));
  }
);

// app/api/inngest/route.ts
import { serve } from "inngest/next";
export const { GET, POST, PUT } = serve({ client: inngest, functions: [sendWelcomeEmail] });`,
      conventions: [
        'Define functions in `inngest/functions/` — one file per function',
        'Use `step.run()` to make each step retriable independently',
        'Use `inngest.send()` to trigger events from your application code',
        'Test locally with `npx inngest-cli dev`',
      ],
    },
  },

  {
    slug: 'bullmq',
    name: 'BullMQ',
    category: 'background-jobs',
    icon: '🐂',
    description: 'Premium Queue and Jobs package for Node.js backed by Redis',
    language: 'typescript',
    npmPackage: 'bullmq',
    compatibleTemplates: ['express'],
    documentationUrls: ['https://docs.bullmq.io/'],
    knowledge: {
      installCommand: 'npm install bullmq ioredis',
      setupSnippet: `import { Queue, Worker } from 'bullmq';
import { redis } from './lib/redis';

// Producer
export const emailQueue = new Queue('email', { connection: redis });

// Add a job
await emailQueue.add('send-welcome', { userId, email }, { delay: 1000 });

// Consumer (separate process/file)
const worker = new Worker('email', async (job) => {
  if (job.name === 'send-welcome') {
    await sendWelcomeEmail(job.data.email);
  }
}, { connection: redis });`,
      conventions: [
        'Run workers in a separate process from your web server',
        'Always provide a `connection` option using a dedicated Redis instance',
        'Use job `attempts` and `backoff` for retry logic',
      ],
    },
  },

  // ── Caching ───────────────────────────────────

  {
    slug: 'upstash-redis',
    name: 'Upstash Redis',
    category: 'other',
    icon: '🔴',
    description: 'Serverless Redis — perfect for Edge and Serverless functions',
    language: 'typescript',
    npmPackage: '@upstash/redis',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://upstash.com/docs/redis/overall/getstarted'],
    knowledge: {
      installCommand: 'npm install @upstash/redis',
      setupSnippet: `// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Usage
await redis.set('key', 'value', { ex: 3600 }); // expires in 1hr
const value = await redis.get('key');
await redis.del('key');`,
      conventions: [
        'Use `ex` option for automatic expiry on cached values',
        'Use `ratelimit` from `@upstash/ratelimit` for API rate limiting',
        'Prefix keys by feature: `user:${id}:profile`, `session:${token}`',
      ],
    },
  },

  // ── Rich Text ─────────────────────────────────

  {
    slug: 'tiptap',
    name: 'Tiptap',
    category: 'ui-components',
    icon: '📄',
    description: 'Headless, framework-agnostic rich text editor',
    language: 'typescript',
    npmPackage: '@tiptap/react @tiptap/pm @tiptap/starter-kit',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://tiptap.dev/introduction'],
    knowledge: {
      installCommand: 'npm install @tiptap/react @tiptap/pm @tiptap/starter-kit',
      usageSnippet: `"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export function RichTextEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return <EditorContent editor={editor} />;
}`,
      conventions: [
        'Start with `StarterKit` — it includes the most common extensions',
        'Store content as HTML or JSON — prefer JSON for programmatic access',
        'Tiptap components must be Client Components — add `"use client"`',
      ],
    },
  },

  // ── Icons ─────────────────────────────────────

  {
    slug: 'lucide-react',
    name: 'Lucide React',
    category: 'ui-components',
    icon: '✦',
    description: 'Beautifully consistent, open-source icon library',
    language: 'typescript',
    npmPackage: 'lucide-react',
    compatibleTemplates: ['nextjs'],
    documentationUrls: ['https://lucide.dev/guide/packages/lucide-react'],
    knowledge: {
      installCommand: 'npm install lucide-react',
      usageSnippet: `import { Search, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

// Usage
<Search className="h-4 w-4 text-muted-foreground" />
<Loader2 className="h-4 w-4 animate-spin" />`,
      conventions: [
        'Always specify `className` with size: `h-4 w-4` or `h-5 w-5`',
        'Use `strokeWidth` prop to adjust line thickness',
        'Import only what you use — tree-shaken automatically',
      ],
    },
  },

  // ── FastAPI Python Packages ───────────────────

  {
    slug: 'pydantic-settings',
    name: 'Pydantic Settings',
    category: 'other',
    icon: '⚙️',
    description: 'Type-safe settings management for Python apps via environment variables',
    language: 'python',
    pyPackage: 'pydantic-settings',
    compatibleTemplates: ['fastapi', 'django'],
    documentationUrls: ['https://docs.pydantic.dev/latest/concepts/pydantic_settings/'],
    knowledge: {
      installCommand: 'pip install pydantic-settings',
      setupSnippet: `# config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()  # reads from .env automatically`,
      conventions: [
        'Create a singleton `settings` object in `config.py` — import it anywhere',
        'Access via `settings.database_url` not `os.environ["DATABASE_URL"]`',
        'Use `model_config = SettingsConfigDict(env_file=".env")` for `.env` support',
      ],
    },
  },

  {
    slug: 'celery',
    name: 'Celery',
    category: 'background-jobs',
    icon: '🥬',
    description: 'Distributed task queue for Python — async background job processing',
    language: 'python',
    pyPackage: 'celery redis',
    compatibleTemplates: ['fastapi', 'django'],
    documentationUrls: ['https://docs.celeryq.dev/en/stable/getting-started/introduction.html'],
    knowledge: {
      installCommand: 'pip install celery redis',
      setupSnippet: `# celery_app.py
from celery import Celery

celery = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)
celery.conf.task_serializer = "json"

# tasks/email.py
from celery_app import celery

@celery.task(bind=True, max_retries=3)
def send_welcome_email(self, user_id: int):
    try:
        user = db.get_user(user_id)
        email_service.send(user.email, "Welcome!")
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)`,
      conventions: [
        'Run workers separately: `celery -A celery_app worker --loglevel=info`',
        'Use `bind=True` on tasks for access to `self.retry()`',
        'Always set `max_retries` to prevent infinite retry loops',
        'Use `apply_async(countdown=60)` to delay task execution',
      ],
    },
  },

  {
    slug: 'alembic',
    name: 'Alembic',
    category: 'other',
    icon: '🧪',
    description: 'Database migrations for SQLAlchemy',
    language: 'python',
    pyPackage: 'alembic',
    compatibleTemplates: ['fastapi'],
    documentationUrls: ['https://alembic.sqlalchemy.org/en/latest/'],
    knowledge: {
      installCommand: 'pip install alembic',
      setupSnippet: `# Initialize:
alembic init alembic

# Configure alembic/env.py — set target_metadata = Base.metadata

# Create migration:
alembic revision --autogenerate -m "add users table"

# Apply:
alembic upgrade head

# Rollback:
alembic downgrade -1`,
      conventions: [
        'Always review auto-generated migrations before applying them',
        'Never edit applied migration files — create a new revision instead',
        'Include `alembic/versions/` in version control',
        'Use descriptive migration messages: `alembic revision -m "add_user_avatar_column"`',
      ],
    },
  },

  {
    slug: 'httpx',
    name: 'HTTPX',
    category: 'data-fetching',
    icon: '🌐',
    description: 'Fully async-compatible HTTP client for Python',
    language: 'python',
    pyPackage: 'httpx',
    compatibleTemplates: ['fastapi', 'django', 'python-ml'],
    documentationUrls: ['https://www.python-httpx.org/'],
    knowledge: {
      installCommand: 'pip install httpx',
      usageSnippet: `import httpx

# Async (recommended with FastAPI)
async def fetch_user(user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://api.example.com/users/{user_id}")
        response.raise_for_status()
        return response.json()`,
      conventions: [
        'Use `AsyncClient` in async contexts (FastAPI endpoints)',
        'Always call `raise_for_status()` to raise on 4xx/5xx responses',
        'Reuse `AsyncClient` instances in long-running apps — create once, use many times',
      ],
    },
  },

  {
    slug: 'structlog',
    name: 'Structlog',
    category: 'monitoring',
    icon: '📋',
    description: 'Structured, composable logging for Python',
    language: 'python',
    pyPackage: 'structlog',
    compatibleTemplates: ['fastapi', 'django', 'python-ml'],
    documentationUrls: ['https://www.structlog.org/en/stable/'],
    knowledge: {
      installCommand: 'pip install structlog',
      setupSnippet: `# logging_config.py
import structlog

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ],
)

log = structlog.get_logger()

# Usage
log.info("user.created", user_id=123, email="user@example.com")
log.error("payment.failed", error=str(e), amount=amount)`,
      conventions: [
        'Always log structured key-value pairs — not formatted strings',
        'Use dotted event names: `"user.created"`, `"payment.failed"`',
        'Bind request context (request_id, user_id) at middleware level',
      ],
    },
  },

  // ── Flutter Packages ──────────────────────────

  {
    slug: 'dio',
    name: 'Dio',
    category: 'data-fetching',
    icon: '🌐',
    description: 'Powerful HTTP client for Dart/Flutter with interceptors',
    language: 'dart',
    pubPackage: 'dio',
    compatibleTemplates: ['flutter'],
    documentationUrls: ['https://pub.dev/packages/dio'],
    knowledge: {
      installCommand: 'flutter pub add dio',
      setupSnippet: `// lib/shared/services/api_client.dart
import 'package:dio/dio.dart';

class ApiClient {
  late final Dio _dio;

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.example.com',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = storage.read('token');
        if (token != null) options.headers['Authorization'] = 'Bearer \$token';
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) { /* refresh token */ }
        handler.next(error);
      },
    ));
  }

  Future<T> get<T>(String path) async {
    final response = await _dio.get(path);
    return response.data as T;
  }
}`,
      conventions: [
        'Create a singleton `ApiClient` and inject via Riverpod/get_it',
        'Use interceptors for auth tokens and global error handling',
        'Use `dio_cache_interceptor` for response caching',
      ],
    },
  },

  {
    slug: 'hive',
    name: 'Hive',
    category: 'other',
    icon: '🗄️',
    description: 'Fast, lightweight key-value database for Flutter',
    language: 'dart',
    pubPackage: 'hive_flutter hive',
    compatibleTemplates: ['flutter'],
    documentationUrls: ['https://docs.hivedb.dev/'],
    knowledge: {
      installCommand: 'flutter pub add hive hive_flutter',
      setupSnippet: `// main.dart
await Hive.initFlutter();
await Hive.openBox('settings');
await Hive.openBox<User>('users'); // typed box

// Usage
final settingsBox = Hive.box('settings');
settingsBox.put('theme', 'dark');
final theme = settingsBox.get('theme', defaultValue: 'light');`,
      conventions: [
        'Open boxes at app startup — do not open repeatedly',
        'Use typed boxes with `@HiveType` and `@HiveField` annotations for complex objects',
        'Use `flutter_secure_storage` for sensitive data — not Hive',
      ],
    },
  },

  {
    slug: 'fl-chart',
    name: 'fl_chart',
    category: 'charts',
    icon: '📊',
    description: 'Powerful chart library for Flutter',
    language: 'dart',
    pubPackage: 'fl_chart',
    compatibleTemplates: ['flutter'],
    documentationUrls: ['https://pub.dev/packages/fl_chart'],
    knowledge: {
      installCommand: 'flutter pub add fl_chart',
      conventions: [
        'Wrap charts in `SizedBox` or `AspectRatio` — they expand to fill available space',
        'Use `LineChartData`, `BarChartData`, `PieChartData` for type-safe configuration',
        'Use `touchCallback` for interactive chart responses',
      ],
    },
  },

  // ── Python ML Packages ────────────────────────

  {
    slug: 'pytorch-lightning',
    name: 'PyTorch Lightning',
    category: 'other',
    icon: '⚡',
    description: 'High-level PyTorch wrapper for professional AI research',
    language: 'python',
    pyPackage: 'lightning',
    compatibleTemplates: ['python-ml'],
    documentationUrls: ['https://lightning.ai/docs/pytorch/latest/'],
    knowledge: {
      installCommand: 'pip install lightning',
      setupSnippet: `import lightning as L
import torch
import torch.nn as nn

class LitModel(L.LightningModule):
    def __init__(self):
        super().__init__()
        self.model = nn.Linear(28 * 28, 10)

    def training_step(self, batch, batch_idx):
        x, y = batch
        loss = torch.nn.functional.cross_entropy(self.model(x), y)
        self.log("train_loss", loss)
        return loss

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=1e-3)

# Train
trainer = L.Trainer(max_epochs=10, accelerator="auto")
trainer.fit(model, datamodule=dm)`,
      conventions: [
        'Define `training_step`, `validation_step`, `configure_optimizers` in LightningModule',
        'Use `self.log()` for metrics — integrates with W&B, MLflow automatically',
        'Use `LightningDataModule` to encapsulate data loading logic',
        'Use `Trainer(accelerator="auto")` — automatically uses GPU if available',
      ],
    },
  },

  {
    slug: 'optuna',
    name: 'Optuna',
    category: 'other',
    icon: '🔬',
    description: 'Automatic hyperparameter optimization framework',
    language: 'python',
    pyPackage: 'optuna',
    compatibleTemplates: ['python-ml'],
    documentationUrls: ['https://optuna.org/#documentation'],
    knowledge: {
      installCommand: 'pip install optuna',
      usageSnippet: `import optuna

def objective(trial):
    lr = trial.suggest_float("lr", 1e-5, 1e-1, log=True)
    n_layers = trial.suggest_int("n_layers", 1, 5)
    dropout = trial.suggest_float("dropout", 0.1, 0.5)

    model = build_model(n_layers=n_layers, dropout=dropout)
    val_loss = train_and_evaluate(model, lr=lr)
    return val_loss

study = optuna.create_study(direction="minimize")
study.optimize(objective, n_trials=100, timeout=3600)

print("Best params:", study.best_params)`,
      conventions: [
        'Use `trial.suggest_*` for hyperparameters — enables Optuna to track the search space',
        'Use `study.optimize(n_jobs=-1)` for parallel trials',
        'Use `optuna.integration.wandb` to log trials to W&B automatically',
      ],
    },
  },

  {
    slug: 'huggingface-transformers',
    name: 'HuggingFace Transformers',
    category: 'other',
    icon: '🤗',
    description: 'State-of-the-art NLP models and pipelines',
    language: 'python',
    pyPackage: 'transformers datasets',
    compatibleTemplates: ['python-ml'],
    documentationUrls: ['https://huggingface.co/docs/transformers/index'],
    knowledge: {
      installCommand: 'pip install transformers datasets accelerate',
      usageSnippet: `from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

model_name = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Inference
inputs = tokenizer("I love this product!", return_tensors="pt")
with torch.no_grad():
    logits = model(**inputs).logits

predicted_class = logits.argmax(-1).item()`,
      conventions: [
        'Always use `AutoTokenizer` and `AutoModel*` — do not hardcode model classes',
        'Cache models locally: set `TRANSFORMERS_CACHE` env var',
        'Use `pipeline()` for quick inference tasks',
        'Use `accelerate` for multi-GPU and mixed precision training',
      ],
    },
  },

  // ── Express Packages ──────────────────────────

  {
    slug: 'winston',
    name: 'Winston',
    category: 'monitoring',
    icon: '📋',
    description: 'Versatile logging library for Node.js',
    language: 'typescript',
    npmPackage: 'winston',
    compatibleTemplates: ['express'],
    documentationUrls: ['https://github.com/winstonjs/winston'],
    knowledge: {
      installCommand: 'npm install winston',
      setupSnippet: `// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.prettyPrint()
  ),
  transports: [new winston.transports.Console()],
});`,
      conventions: [
        'Use JSON format in production — structured logs are machine-readable',
        'Never use `console.log` in application code — always use logger',
        'Include `requestId` and `userId` in log context via `child()` logger',
      ],
    },
  },

  {
    slug: 'helmet',
    name: 'Helmet',
    category: 'other',
    icon: '⛑️',
    description: 'Security headers middleware for Express',
    language: 'typescript',
    npmPackage: 'helmet',
    compatibleTemplates: ['express'],
    documentationUrls: ['https://helmetjs.github.io/'],
    knowledge: {
      installCommand: 'npm install helmet',
      setupSnippet: `import helmet from 'helmet';

// Use early in middleware chain
app.use(helmet());

// Configure CSP if needed
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));`,
      conventions: [
        'Apply `helmet()` as one of the first middlewares — before routes',
        'Customize CSP directives for your specific frontend needs',
      ],
    },
  },
];

/** All package categories with display metadata */
export const PACKAGE_CATEGORIES: PackageCategoryMeta[] = [
  { slug: 'data-fetching',   label: 'Data Fetching',    icon: '🔄' },
  { slug: 'forms-validation', label: 'Forms & Validation', icon: '📝' },
  { slug: 'ui-components',   label: 'UI Components',    icon: '🎨' },
  { slug: 'animation',       label: 'Animation',        icon: '✨' },
  { slug: 'auth',            label: 'Authentication',   icon: '🔐' },
  { slug: 'payments',        label: 'Payments',         icon: '💳' },
  { slug: 'email',           label: 'Email',            icon: '📧' },
  { slug: 'file-upload',     label: 'File Upload',      icon: '📁' },
  { slug: 'monitoring',      label: 'Monitoring',       icon: '🔍' },
  { slug: 'charts',          label: 'Charts',           icon: '📊' },
  { slug: 'realtime',        label: 'Real-time',        icon: '⚡' },
  { slug: 'background-jobs', label: 'Background Jobs',  icon: '⚙️' },
  { slug: 'other',           label: 'Other',            icon: '📦' },
];

// Re-export type for consumers
export type { PackageCategoryMeta } from './types';

/**
 * Get packages filtered by compatible template slug.
 * Returns only packages relevant to the user's chosen framework.
 */
export function getPackagesForTemplate(templateSlug: string): PackageDefinition[] {
  return PACKAGE_LIBRARY.filter(pkg => pkg.compatibleTemplates.includes(templateSlug));
}

/**
 * Look up a single package definition by slug.
 */
export function getPackageDefinition(slug: string): PackageDefinition | undefined {
  return PACKAGE_LIBRARY.find(pkg => pkg.slug === slug);
}
