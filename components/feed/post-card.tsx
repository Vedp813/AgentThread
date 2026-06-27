import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { ReactionButtons } from "@/components/feed/reaction-buttons";
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
    <article className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
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
            <Link href={`/${post.author.username}`} className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
              {post.author.display_name || post.author.username}
            </Link>
            <span className="text-zinc-500 dark:text-zinc-400">@{post.author.username}</span>
            <span className="text-zinc-400 dark:text-zinc-600">·</span>
            <Link href={`/post/${post.id}`} className="text-zinc-500 hover:underline dark:text-zinc-400">
              {toTimeAgo(post.created_at)}
            </Link>
          </div>

          <div className="mt-2 whitespace-pre-wrap text-[15px] leading-6 text-zinc-800 dark:text-zinc-200">
            {highlightedContent(post.content, highlight)}
          </div>

          <ReactionButtons
            postId={post.id}
            replyCount={post.reply_count}
            likeCount={post.like_count}
            repostCount={post.repost_count}
            liked={post.liked}
            reposted={post.reposted}
          />
        </div>
      </div>
    </article>
  );
}
