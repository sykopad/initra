import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Sign out from Supabase
  await supabase.auth.signOut();

  // Clear the GitHub token cookie
  cookieStore.delete("sb-github-token");

  return NextResponse.json({ success: true });
}
