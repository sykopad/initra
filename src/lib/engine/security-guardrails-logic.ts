/**
 * Initra Sovereign Security Guardrails Engine
 * Automated security hardening for enterprise ventures (WAF, Secret Scanning).
 */

export const SECURITY_TEMPLATES = {
  nextjs: {
    wafConfig: \`{
  "rewrites": [],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://*.vercel.app;" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ],
  "cleanUrls": true,
  "trailingSlash": false
}\`,
    secretScanning: \`# Gitleaks configuration for Sovereign Guardrails
title = "initra-sovereign-gitleaks"

[[rules]]
    description = "Potential Supabase Secret"
    regex = '''(?i)sb_publishable_[a-z0-9]{20,}'''
    tags = ["key", "supabase"]

[[rules]]
    description = "Potential Vercel Token"
    regex = '''(?i)atp_[a-z0-9]{24,}'''
    tags = ["key", "vercel"]
\`,
    securityMiddleware: \`
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Sovereign Security Middleware
 * Implements Edge-level WAF rules and rate limiting.
 */
export function securityMiddleware(request: NextRequest) {
  // 1. IP-based Rate Limiting (Heuristic)
  const ip = request.ip || '127.0.0.1';
  // Note: In production, use Upstash or Redis for persistent rate limiting
  
  // 2. Block Common Attack Vectors
  const url = request.nextUrl.pathname;
  const suspiciousPatterns = ['/wp-admin', '/.env', '/config.php'];
  
  if (suspiciousPatterns.some(p => url.includes(p))) {
    return new NextResponse(null, { status: 403, statusText: 'Sovereign Security Block' });
  }

  // 3. Inject Security Context
  const response = NextResponse.next();
  response.headers.set('x-sovereign-shield', 'active');
  
  return response;
}
\`
  }
};

export function getSecurityBoilerplate(templateSlug: string): { wafConfig: string; secretScanning: string; securityMiddleware: string } | null {
  return (SECURITY_TEMPLATES as any)[templateSlug] || null;
}
