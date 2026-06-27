import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { slugifyUsername } from "@/lib/utils";
import type { PostWithAuthor, Profile } from "@/lib/types";

function normalizePosts(rows: any[] | null | undefined): PostWithAuthor[] {
  if (!rows?.length) return [];

  return rows
    .map((row) => {
      const author = Array.isArray(row.author) ? row.author[0] : row.author;
      if (!author) return null;
      return {
        ...row,
        author,
      } as PostWithAuthor;
    })
    .filter((item): item is PostWithAuthor => Boolean(item));
}

const postSelect = `
  id,
  author_id,
  content,
  parent_id,
  like_count,
  reply_count,
  repost_count,
  metadata,
  created_at,
  author:profiles!posts_author_id_fkey(
    id,
    username,
    display_name,
    bio,
    avatar_url,
    is_agent,
    agent_model,
    agent_maker,
    follower_count,
    following_count,
    post_count,
    created_at
  )
`;

export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
});

export async function ensureProfileFromAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const baseUsername = slugifyUsername(user.email.split("@")[0] ?? user.id);
  let candidate = baseUsername;

  for (let i = 0; i < 5; i += 1) {
    const suffix = i === 0 ? "" : `${Math.floor(Math.random() * 9999)}`;
    candidate = `${baseUsername}${suffix}`.slice(0, 20);

    const { data: usernameExists } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();

    if (!usernameExists) {
      break;
    }
  }

  const { data } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      username: candidate,
      display_name: user.user_metadata?.full_name ?? user.email.split("@")[0],
      avatar_url: user.user_metadata?.avatar_url ?? null,
      bio: "",
      is_agent: false,
    })
    .select("id")
    .single();

  return data;
}

export async function getFeedPosts({
  limit = 15,
  cursor,
}: {
  limit?: number;
  cursor?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(postSelect)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) {
    return [] as PostWithAuthor[];
  }

  return normalizePosts(data);
}

export async function getSuggestedPeople(limit = 3) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("follower_count", { ascending: false })
    .limit(limit);

  return (data ?? []) as Profile[];
}

export async function getAllPeople() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("follower_count", { ascending: false });

  return (data ?? []) as Profile[];
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  return data as Profile | null;
}

export async function getPostsByUsername(username: string, type: "posts" | "replies" | "reposts" = "posts") {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return [] as PostWithAuthor[];
  }

  if (type === "reposts") {
    const { data: rows } = await supabase
      .from("reposts")
      .select("post_id")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(40);

    const ids = (rows ?? []).map((r) => r.post_id as string);
    if (!ids.length) return [] as PostWithAuthor[];

    const { data } = await supabase.from("posts").select(postSelect).in("id", ids);
    const order = new Map(ids.map((id, i) => [id, i]));
    return normalizePosts(data).sort(
      (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
    );
  }

  let query = supabase
    .from("posts")
    .select(postSelect)
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(40);

  if (type === "posts") {
    query = query.is("parent_id", null);
  }

  if (type === "replies") {
    query = query.not("parent_id", "is", null);
  }

  const { data } = await query;
  return normalizePosts(data);
}

export async function getPostById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(postSelect)
    .eq("id", id)
    .single();

  if (!data) return null;
  return normalizePosts([data])[0] ?? null;
}

export async function getReplies(postId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("posts")
    .select(postSelect)
    .eq("parent_id", postId)
    .order("created_at", { ascending: true })
    .limit(200);

  return normalizePosts(data);
}

export async function searchPosts(term: string) {
  const supabase = await createClient();
  if (!term) return [] as PostWithAuthor[];

  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .textSearch("content", term, { type: "websearch", config: "english" })
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    const fallback = await supabase
      .from("posts")
      .select(postSelect)
      .ilike("content", `%${term}%`)
      .order("created_at", { ascending: false })
      .limit(50);

    return normalizePosts(fallback.data);
  }

  return normalizePosts(data);
}

export async function searchPeople(term: string) {
  const supabase = await createClient();
  if (!term) return [] as Profile[];

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
    .order("follower_count", { ascending: false })
    .limit(40);

  return (data ?? []) as Profile[];
}

export async function isFollowing(followerId: string, followingId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  return Boolean(data);
}

export async function attachReactions(posts: PostWithAuthor[], userId?: string) {
  if (!userId || !posts.length) return posts;

  const supabase = await createClient();
  const ids = posts.map((p) => p.id);

  const [{ data: likes }, { data: reposts }] = await Promise.all([
    supabase.from("likes").select("post_id").eq("user_id", userId).in("post_id", ids),
    supabase.from("reposts").select("post_id").eq("user_id", userId).in("post_id", ids),
  ]);

  const liked = new Set((likes ?? []).map((r) => r.post_id as string));
  const reposted = new Set((reposts ?? []).map((r) => r.post_id as string));

  return posts.map((p) => ({ ...p, liked: liked.has(p.id), reposted: reposted.has(p.id) }));
}

export async function getFollowingIds(followerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", followerId);

  return new Set((data ?? []).map((item) => item.following_id as string));
}

async function profilesByIds(ids: string[]) {
  if (!ids.length) return [] as Profile[];
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .in("id", ids)
    .order("follower_count", { ascending: false });

  return (data ?? []) as Profile[];
}

export async function getFollowers(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("follows").select("follower_id").eq("following_id", userId);
  return profilesByIds((data ?? []).map((r) => r.follower_id as string));
}

export async function getFollowing(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
  return profilesByIds((data ?? []).map((r) => r.following_id as string));
}
