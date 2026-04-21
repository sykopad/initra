/**
 * Initra — Intelligence Overlays Registry
 * Behavioral Brain Modules for IDE Agents.
 */

export interface IntelligenceModule {
  id: string;
  name: string;
  icon: string;
  description: string;
  instructions: string;
}

export const BRAIN_MODULES: Record<string, IntelligenceModule> = {
  designer: {
    id: 'designer',
    name: 'V0 Designer',
    icon: '🎨',
    description: 'Specializes in high-fidelity UI/UX, responsive layouts, and CSS variable management.',
    instructions: `
## UI/UX & Design Directives (V0 Designer)
- **Design System First**: Always use the CSS variables defined in \`globals.css\` (e.g., \`--primary\`, \`--background\`, \`--glass-bg\`).
- **Rich Aesthetics**: Prioritize modern UI trends: glassmorphism, subtle gradients, and smooth micro-animations.
- **Responsiveness**: Use fluid typography and mobile-first container patterns.
- **Component Hygiene**: Extract reusable UI patterns into \`src/components/ui\` using atomic design principles.
- **Accessibility**: Ensure high contrast ratios and appropriate ARIA labels for all interactive elements.
`
  },
  architect: {
    id: 'architect',
    name: 'Logic Architect',
    icon: '🏗️',
    description: 'Expert in clean code, algorithmic efficiency, and scalable state management.',
    instructions: `
## Architectural Directives (Logic Architect)
- **Early Returns**: Favor guard clauses to reduce nesting depth.
- **Functional Patterns**: Use descriptive naming, immutable state updates, and pure logic functions where possible.
- **Type Rigidity**: Avoid \`any\`. Use strict TypeScript interfaces and Zod schemas for all external data.
- **Error Orchestration**: Implement standardized try/catch/refine patterns with meaningful user feedback.
- **Performance**: Optimize for re-render minimization and efficient data fetching (e.g., React Query or Server Components).
`
  },
  security: {
    id: 'security',
    name: 'Security Sentinel',
    icon: '🛡️',
    description: 'Rigorous focus on authentication, RLS, and data sanitization.',
    instructions: `
## Security Directives (Security Sentinel)
- **Zero Trust Data**: Never trust client-side inputs. Always validate on the server/DB level.
- **Sovereign Auth**: Strictly implement Supabase Auth patterns. Ensure every query is filtered by \`auth.uid()\`.
- **Secret Hygiene**: Never hardcode keys. Use \`process.env\` and ensure sensitive data is omitted from client bundles.
- **Sanitization**: Sanitize all user-generated content to prevent XSS and SQL injection.
- **RLS Enforcement**: Before creating a table, define a corresponding Row Level Security policy in your mental model or code.
`
  }
};

/**
 * Technical ADRs (Architectural Decision Records) for specific frameworks
 */
export const FRAMEWORK_ADRS: Record<string, string> = {
  nextjs: `
## Next.js 16 ADR (Architectural Decision Record)
- **Turbopack Mode**: Use \`next dev --turbo\` for development.
- **Server Actions**: Prefer Server Actions over API routes for form submissions and mutations.
- **RSC Strategy**: Keep Client Components leaf-level. Use Server Components for all data fetching and layout structure.
- **Metadata API**: Use the dynamic Metadata API for SEO rather than \`next/head\`.
`,
  nuxt: `
## Nuxt 4 ADR (Architectural Decision Record)
- **Composition API**: Exclusively use \`<script setup>\` with composition API patterns.
- **Nitro Logic**: Place all server-side logic in \`server/api\` or \`server/middleware\`.
- **Auto-imports**: Leverage Nuxt auto-imports for components and composables to maintain clean code.
- **State Management**: Use \`useState\` for simple state or Pinia for complex domain models.
`,
  django: `
## Django 6 ADR (Architectural Decision Record)
- **MVT Purity**: Keep views thin and models thick. Encapsulate business logic in Model methods or Services.
- **Type Hinting**: Use Python type hints for all view arguments and helper functions.
- **Template Blocks**: Use a robust template inheritance tree starting from \`base.html\`.
`,
  go: `
## Go (Gin/Axum) ADR (Architectural Decision Record)
- **Domain Driven**: Group logic by domain rather than layer (e.g., \`pkg/auth\`, \`pkg/billing\`).
- **Middleware First**: Use Gin middleware for cross-cutting concerns (Auth, Logging, Recovery).
- **Concurrency**: Use goroutines only for truly asynchronous tasks; avoid over-concurrency in requests.
`
};
