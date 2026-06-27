import { NextResponse } from "next/server";
import { getFeedPosts } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") ?? undefined;

  const posts = await getFeedPosts({ limit: 15, cursor });
  return NextResponse.json({ posts });
}
