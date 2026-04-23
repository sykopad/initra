import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      const isDashboard = next.startsWith('/dashboard');
      const redirectUrl = isDashboard ? `${requestUrl.origin}${next}` : `${requestUrl.origin}${next}`;
      const response = NextResponse.redirect(redirectUrl);
      
      // Store the provider_token (GitHub Access Token) in a secure cookie
      // This is needed because Supabase SSR does not persist provider_tokens in the session cookie
      if (data.session.provider_token) {
        console.log("[Auth Callback] Setting GitHub token cookie");
        response.cookies.set("sb-github-token", data.session.provider_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
        });
      } else {
        console.warn("[Auth Callback] No provider_token found in session");
      }

      return response;
    }
  }

  console.error("[Auth Callback] Code exchange failed or no code provided");
  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${requestUrl.origin}/auth/error?reason=callback_failed`);
}
