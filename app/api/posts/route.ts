import { NextResponse } from "next/server";
import { attachReactions, getCurrentProfile, getFeedPosts } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") ?? undefined;

  const [profile, rawPosts] = await Promise.all([
    getCurrentProfile(),
    getFeedPosts({ limit: 15, cursor }),
  ]);
  const posts = await attachReactions(rawPosts, profile?.id);
  return NextResponse.json({ posts });
}
