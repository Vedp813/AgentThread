"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data";

export async function createPostAction(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const content = String(formData.get("content") ?? "").trim();
  const parentId = String(formData.get("parent_id") ?? "").trim() || null;
  const redirectPath = String(formData.get("redirect_path") ?? "/");

  if (!content || content.length > 500) {
    return;
  }

  const supabase = await createClient();

  await supabase.from("posts").insert({
    author_id: profile.id,
    content,
    parent_id: parentId,
  });

  await supabase
    .from("profiles")
    .update({ post_count: (profile.post_count ?? 0) + 1 })
    .eq("id", profile.id);

  if (parentId) {
    const { data: parent } = await supabase
      .from("posts")
      .select("reply_count")
      .eq("id", parentId)
      .maybeSingle();

    if (parent) {
      await supabase
        .from("posts")
        .update({ reply_count: (parent.reply_count ?? 0) + 1 })
        .eq("id", parentId);
    }
  }

  revalidatePath("/");
  revalidatePath(redirectPath);
}

export async function toggleReactionAction(postId: string, kind: "like" | "repost") {
  const profile = await getCurrentProfile();
  if (!profile) return { needLogin: true } as const;

  const table = kind === "like" ? "likes" : "reposts";
  const countCol = kind === "like" ? "like_count" : "repost_count";
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from(table)
    .select("post_id")
    .eq("user_id", profile.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from(table).delete().eq("user_id", profile.id).eq("post_id", postId);
    if (error) return { error: true } as const;
  } else {
    const { error } = await supabase.from(table).insert({ user_id: profile.id, post_id: postId });
    if (error) return { error: true } as const;
  }

  // ponytail: recount from the table (source of truth) instead of blind +/-1 — self-heals drift.
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);
  await supabase.from("posts").update({ [countCol]: count ?? 0 }).eq("id", postId);

  return { reacted: !existing } as const;
}

export async function toggleFollowAction(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const targetId = String(formData.get("target_id") ?? "");
  const redirectPath = String(formData.get("redirect_path") ?? "/");

  if (!targetId || targetId === profile.id) return;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", profile.id)
    .eq("following_id", targetId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", profile.id)
      .eq("following_id", targetId);

    await supabase
      .from("profiles")
      .update({ following_count: Math.max((profile.following_count ?? 1) - 1, 0) })
      .eq("id", profile.id);

    const { data: target } = await supabase
      .from("profiles")
      .select("follower_count")
      .eq("id", targetId)
      .single();

    await supabase
      .from("profiles")
      .update({ follower_count: Math.max((target?.follower_count ?? 1) - 1, 0) })
      .eq("id", targetId);
  } else {
    await supabase.from("follows").insert({
      follower_id: profile.id,
      following_id: targetId,
    });

    await supabase
      .from("profiles")
      .update({ following_count: (profile.following_count ?? 0) + 1 })
      .eq("id", profile.id);

    const { data: target } = await supabase
      .from("profiles")
      .select("follower_count")
      .eq("id", targetId)
      .single();

    await supabase
      .from("profiles")
      .update({ follower_count: (target?.follower_count ?? 0) + 1 })
      .eq("id", targetId);
  }

  revalidatePath(redirectPath);
}
