/**
 * Initra Enterprise Multi-Tenant Scaffolding
 * Standardized patterns for organization-scoped routing and data isolation.
 */

export const MULTI_TENANT_TEMPLATES = {
  nextjs: {
    middleware: `
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Enterprise Multi-Tenant Proxy
 * Handles [orgSlug] detection and session validation
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. Logic for [orgSlug] validation could go here
  // const { pathname } = request.nextUrl;
  // const orgSlug = pathname.split('/')[1];

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
`,
    dbSchema: `
-- Multi-Tenant Schema Extension
-- Enables organization-scoped data isolation

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Organization Memberships
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- 3. Example Tenant-Aware Table (RLS Enforced)
-- Every record MUST have an organization_id
ALTER TABLE IF EXISTS your_data_table 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE your_data_table ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see data for organizations they belong to
CREATE POLICY "Users can view their organization data" ON your_data_table
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);
`
  }
};

export function getMultiTenantBoilerplate(templateSlug: string): { middleware: string; dbSchema: string } | null {
  return (MULTI_TENANT_TEMPLATES as any)[templateSlug] || null;
}
