import { FrameworkVersion } from "./types";

export interface VersionedKnowledge {
  versionId: string;
  major: number;
  antiPatterns: string[];
  conventions: string[];
  documentationUrls: string[];
  recommendedPatterns: {
    title: string;
    description: string;
    code?: string;
  }[];
}

export const FRAMEWORK_KNOWLEDGE: Record<string, VersionedKnowledge[]> = {
  "nextjs": [
    {
      versionId: "16.2.4",
      major: 16,
      antiPatterns: [
        "Never use 'getServerSideProps' or 'getStaticProps' (Legacy Page Router).",
        "Avoid using 'pages/' directory for routing; use 'app/' exclusively.",
        "Don't use 'next/router'; use 'next/navigation' for App Router hooks."
      ],
      conventions: [
        "Use 'use client' directive only at the leaf component level.",
        "Server Components by default (no directive needed).",
        "Use 'loading.tsx', 'error.tsx', and 'layout.tsx' file-based conventions.",
        "Prefer 'fetch' with built-in Next.js caching over external libraries like axios where possible."
      ],
      documentationUrls: [
        "https://nextjs.org/docs",
        "https://nextjs.org/docs/app/building-your-application/upgrading/from-v15-to-v16"
      ],
      recommendedPatterns: [
        {
          title: "App Router Data Fetching",
          description: "Fetching data directly in a Server Component.",
          code: "async function Page() {\n  const data = await fetch('https://api...');\n  return <main>{/* ... */}</main>;\n}"
        }
      ]
    },
    {
      versionId: "15.0.0",
      major: 15,
      antiPatterns: [
        "Don't mix Client and Server components in the same file.",
        "Avoid heavy processing in Client Components."
      ],
      conventions: [
        "Standard App Router patterns.",
        "React 19 support."
      ],
      documentationUrls: ["https://nextjs.org/docs/15"],
      recommendedPatterns: []
    }
  ],
  "nuxt": [
    {
      versionId: "4.4.2",
      major: 4,
      antiPatterns: [
        "Avoid Option API (use Composition API with <script setup>).",
        "Don't use Vuex (use Pinia)."
      ],
      conventions: [
        "Auto-imports for components and composables.",
        "Server-only routes in /server directory."
      ],
      documentationUrls: ["https://nuxt.com/docs/getting-started/introduction"],
      recommendedPatterns: []
    }
  ],
  "django": [
    {
      versionId: "6.0.4",
      major: 6,
      antiPatterns: [
        "Avoid using old function-based views for complex logic.",
        "Don't use synchronous database calls in async handlers."
      ],
      conventions: [
        "Use 'path()' instead of 'url()' in urls.py.",
        "Full async support for views and ORM."
      ],
      documentationUrls: ["https://docs.djangoproject.com/en/6.0/"],
      recommendedPatterns: []
    }
  ]
};

export function getVersionKnowledge(templateSlug: string, versionId: string): VersionedKnowledge | null {
  const versions = FRAMEWORK_KNOWLEDGE[templateSlug];
  if (!versions) return null;
  return versions.find(v => v.versionId === versionId) || null;
}
