/**
 * Initra Global Sovereign Edge Deployment
 * Standardized patterns for multi-region Vercel configurations and edge optimizations.
 */

export const EDGE_DEPLOYMENT_TEMPLATES = {
  nextjs: {
    vercelJson: \`{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "hnd1", "cdg1", "fra1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "x-initra-edge",
          "value": "sovereign-active"
        },
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=31536000, stale-while-revalidate=59"
        }
      ]
    }
  ]
}\`,
    edgeConfig: \`
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Global Edge Optimizer
 * Handles region-aware caching and low-latency routing
 */
export function middleware(request: NextRequest) {
  const region = request.geo?.region || 'global';
  const country = request.geo?.country || 'unknown';
  
  const response = NextResponse.next();
  
  // Inject Geo-Context for dynamic edge rendering
  response.headers.set('x-initra-region', region);
  response.headers.set('x-initra-country', country);
  
  // Global Cache Enforcements
  if (request.nextUrl.pathname.startsWith('/api/static')) {
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }

  return response;
}
\`
  }
};

export function getEdgeDeploymentBoilerplate(templateSlug: string): { vercelJson: string; edgeConfig: string } | null {
  return (EDGE_DEPLOYMENT_TEMPLATES as any)[templateSlug] || null;
}
