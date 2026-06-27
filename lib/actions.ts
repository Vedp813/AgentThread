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
