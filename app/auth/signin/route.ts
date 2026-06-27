import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/";
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
    },
  });

  return NextResponse.redirect(data.url ?? `${process.env.NEXT_PUBLIC_SITE_URL}/login`);
}
