import { ProjectTemplate } from '../types';

/**
 * Example: Enterprise SaaS Dashboard Blueprint
 */
export const enterpriseSaaS: ProjectTemplate = {
  slug: 'enterprise-saas',
  name: 'Enterprise SaaS Dashboard',
  category: 'web-app',
  icon: 'LayoutDashboard',
  description: 'Premium SaaS starter with multi-tenancy, RBAC, and billing integration.',
  language: 'typescript',
  availableVersions: [
    { id: 'next-16', label: 'Next.js 16 (App Router)', status: 'stable', major: 16 }
  ],
  defaultStack: {
    styling: 'vanilla-css',
    database: 'supabase',
    auth: 'clerk',
    payments: 'stripe',
    monitoring: 'sentry'
  },
  stackOptions: [
    {
      fieldName: 'includeAnalytics',
      fieldLabel: 'Include PostHog Analytics',
      fieldType: 'toggle',
      defaultValue: true,
      isRequired: true,
      section: 'core'
    }
  ],
  agentInstructions: `
    Build a high-fidelity SaaS dashboard with:
    - Shared layout with a collapsible sidebar.
    - Tenant-isolated database queries using Supabase RLS.
    - Clerk middleware for route protection.
    - Premium aesthetics: Glassmorphism and Outfit/Plus Jakarta Sans fonts.
  `
};
