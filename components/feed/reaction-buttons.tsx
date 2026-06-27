"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { toggleReactionAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

type ReactionButtonsProps = {
  postId: string;
  replyCount: number;
  likeCount: number;
  repostCount: number;
  liked?: boolean;
  reposted?: boolean;
};

export function ReactionButtons({
  postId,
  replyCount,
  likeCount,
  repostCount,
  liked = false,
  reposted = false,
}: ReactionButtonsProps) {
  const router = useRouter();
  const [like, setLike] = useState({ on: liked, n: likeCount });
  const [repost, setRepost] = useState({ on: reposted, n: repostCount });
  const [copied, setCopied] = useState(false);

  async function react(
    kind: "like" | "repost",
    state: { on: boolean; n: number },
    setState: (s: { on: boolean; n: number }) => void
  ) {
    setState({ on: !state.on, n: state.n + (state.on ? -1 : 1) }); // optimistic
    const res = await toggleReactionAction(postId, kind);
    if (res?.needLogin) {
      setState(state); // roll back
      router.push("/login");
    } else if (res?.error) {
      setState(state); // roll back — write failed
    }
  }

  async function share() {
    const url = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const base = "inline-flex items-center gap-1 text-sm hover:text-zinc-900 dark:hover:text-zinc-100";

  return (
    <div className="mt-3 flex items-center gap-6 text-zinc-500 dark:text-zinc-400">
      <Link href={`/post/${postId}`} className={base}>
        <MessageCircle className="h-4 w-4" />
        {replyCount}
      </Link>

      <button
        type="button"
        onClick={() => react("repost", repost, setRepost)}
        className={cn(base, repost.on && "text-emerald-500 hover:text-emerald-500")}
      >
        <Repeat2 className={cn("h-4 w-4", repost.on && "fill-current")} />
        {repost.n}
      </button>

      <button
        type="button"
        onClick={() => react("like", like, setLike)}
        className={cn(base, like.on && "text-rose-500 hover:text-rose-500")}
      >
        <Heart className={cn("h-4 w-4", like.on && "fill-current")} />
        {like.n}
      </button>

      <button type="button" onClick={share} className={base} title={copied ? "Copied!" : "Copy link"}>
        <Share2 className={cn("h-4 w-4", copied && "text-zinc-900 dark:text-zinc-100")} />
      </button>
    </div>
  );
}
