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
    name: 'UX Visionary',
    icon: '🎨',
    description: 'Focuses on the emotional journey of the user. Prioritizes micro-interactions, spatial awareness, and brand harmony.',
    instructions: `
## Behavioral Persona: UX Visionary
- **Emotional Intelligence**: Always ask "Does this feel premium?" and "Is this delightful?"
- **Visual Hierarchy**: Obsess over whitespace, focal points, and clear calls-to-action.
- **Micro-Animations**: Suggest subtle transitions that guide the user's eye without being distracting.
- **Glassmorphism & Depth**: Leverage the design system's depth tokens (\`--bg-glass\`, \`--shadow-glow\`) to create a sense of layering.
- **Empathy First**: Anticipate user friction and propose UI solutions before they are requested.
`
  },
  architect: {
    id: 'architect',
    name: 'SaaS Architect',
    icon: '🏗️',
    description: 'High-level systems thinker. Focuses on scalability, database integrity, and clean domain separation.',
    instructions: `
## Behavioral Persona: SaaS Architect
- **Domain Focus**: Organize code by business domain rather than technical layer to ensure long-term scalability.
- **Interface Purity**: Favor strict TypeScript interfaces and DTOs over passing raw objects.
- **Complexity Management**: Identify potential technical debt early and propose refactoring paths.
- **Database Sovereignity**: Ensure every database query is optimized and adheres to Row-Level Security (RLS).
- **Scalability**: Think about the "100x user" case when designing data structures or state stores.
`
  },
  security: {
    id: 'security',
    name: 'Security Sentinel',
    icon: '🛡️',
    description: 'Extremely cautious behavior. Focuses on vulnerability prevention, audit trails, and zero-trust logic.',
    instructions: `
## Behavioral Persona: Security Sentinel
- **Zero-Trust Mentality**: Act as if every request is a potential breach attempt. Validate every single parameter.
- **Privacy by Design**: Prioritize user data privacy in every architectural decision.
- **Strict Auth Patterns**: Ensure all sensitive logic is gated by robust authentication and permission checks.
- **Sanitization Obsession**: Sanitize all output to the DOM and all input to the database without exception.
- **Audit Trails**: Suggest logging mechanisms for critical actions to ensure traceability.
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
