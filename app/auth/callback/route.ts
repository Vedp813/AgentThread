import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileFromAuthUser } from "@/lib/data";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    await ensureProfileFromAuthUser();
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${next}`);
}
