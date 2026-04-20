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
        "Avoid Options API (use Composition API with <script setup>).",
        "Don't use Vuex (use Pinia).",
        "Avoid using 'window' or 'document' directly outside of onMounted hooks.",
        "Don't manually import components from the components directory (auto-imports)."
      ],
      conventions: [
        "Use auto-imports for components and composables.",
        "Use Server-only routes in the /server directory.",
        "Prefer 'useFetch' and 'useAsyncData' for data fetching to ensure SSR compatibility.",
        "Use 'definePageMeta' for layout and middleware configuration."
      ],
      documentationUrls: [
        "https://nuxt.com/docs/getting-started/introduction",
        "https://nuxt.com/docs/guide/concepts/auto-imports"
      ],
      recommendedPatterns: [
        {
          title: "Async Data Fetching",
          description: "Fetching data on the server with full hydration support.",
          code: "<script setup>\nconst { data, pending, error } = await useFetch('/api/data')\n</script>"
        }
      ]
    }
  ],
  "django": [
    {
      versionId: "6.0.4",
      major: 6,
      antiPatterns: [
        "Avoid using old function-based views for complex logic.",
        "Don't use synchronous database calls in async handlers.",
        "Avoid putting sensitive logic in template tags.",
        "Don't ignore the 'SECRET_KEY' in production settings."
      ],
      conventions: [
        "Use 'path()' instead of 'url()' in urls.py.",
        "Full async support for views and ORM.",
        "Use Class-Based Views (CBVs) for standard CRUD operations.",
        "Use 'django-environ' or 'python-dotenv' for environment variable management."
      ],
      documentationUrls: [
        "https://docs.djangoproject.com/en/6.0/",
        "https://www.django-rest-framework.org/"
      ],
      recommendedPatterns: [
        {
          title: "Async View",
          description: "Standard asynchronous view for non-blocking I/O.",
          code: "async function my_view(request):\n    data = await MyModel.objects.afirst()\n    return JsonResponse({'data': data.name})"
        }
      ]
    }
  ],
  "go-gin": [
    {
      versionId: "1.10.0",
      major: 1,
      antiPatterns: [
        "Don't use global variables for database connections (use dependency injection).",
        "Avoid using 'panic' for normal error handling; return errors instead.",
        "Don't block the main event loop with heavy computation."
      ],
      conventions: [
        "Use the Standard Project Layout (cmd/, internal/, pkg/).",
        "Use middleware for cross-cutting concerns (logging, auth).",
        "Validate request bodies using 'binding' tags in structs.",
        "Always handle context cancellation for long-running operations."
      ],
      documentationUrls: [
        "https://gin-gonic.com/docs/",
        "https://go.dev/doc/effective_go"
      ],
      recommendedPatterns: [
        {
          title: "Handler Dependency Injection",
          description: "Injecting database or services into handlers via a controller struct.",
          code: "type UserController struct {\n    repo *UserRepository\n}\n\nfunc (u *UserController) GetUser(c *gin.Context) {\n    user := u.repo.FindByID(c.Param(\"id\"))\n    c.JSON(200, user)\n}"
        }
      ]
    }
  ]
};

export function getVersionKnowledge(templateSlug: string, versionId: string): VersionedKnowledge | null {
  const versions = FRAMEWORK_KNOWLEDGE[templateSlug];
  if (!versions) return null;
  return versions.find(v => v.versionId === versionId) || null;
}
