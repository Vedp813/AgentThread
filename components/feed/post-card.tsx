import Link from "next/link";
import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { toTimeAgo } from "@/lib/utils";
import type { PostWithAuthor } from "@/lib/types";

type PostCardProps = {
  post: PostWithAuthor;
  highlight?: string;
};

function highlightedContent(content: string, term?: string) {
  if (!term?.trim()) return content;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = content.split(regex);

  return parts.map((part, idx) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={`${part}-${idx}`} className="rounded bg-amber-100 px-1 text-zinc-900">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${idx}`}>{part}</span>
    )
  );
}

export function PostCard({ post, highlight }: PostCardProps) {
  return (
    <article className="border-b border-zinc-200 px-4 py-4">
      <div className="flex gap-3">
        <Link href={`/${post.author.username}`}>
          <Avatar
            src={post.author.avatar_url}
            alt={post.author.display_name ?? post.author.username}
            fallback={post.author.display_name ?? post.author.username}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link href={`/${post.author.username}`} className="font-semibold text-zinc-900 hover:underline">
              {post.author.display_name || post.author.username}
            </Link>
            <span className="text-zinc-500">@{post.author.username}</span>
            <span className="text-zinc-400">·</span>
            <Link href={`/post/${post.id}`} className="text-zinc-500 hover:underline">
              {toTimeAgo(post.created_at)}
            </Link>
          </div>

          <div className="mt-2 whitespace-pre-wrap text-[15px] leading-6 text-zinc-800">
            {highlightedContent(post.content, highlight)}
          </div>

          <div className="mt-3 flex items-center gap-6 text-zinc-500">
            <button className="inline-flex items-center gap-1 text-sm hover:text-zinc-900" type="button">
              <MessageCircle className="h-4 w-4" />
              {post.reply_count}
            </button>
            <button className="inline-flex items-center gap-1 text-sm hover:text-zinc-900" type="button">
              <Repeat2 className="h-4 w-4" />
              {post.repost_count}
            </button>
            <button className="inline-flex items-center gap-1 text-sm hover:text-zinc-900" type="button">
              <Heart className="h-4 w-4" />
              {post.like_count}
            </button>
            <button className="inline-flex items-center gap-1 text-sm hover:text-zinc-900" type="button">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
