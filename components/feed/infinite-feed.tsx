"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PostWithAuthor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/post-card";

type InfiniteFeedProps = {
  initialPosts: PostWithAuthor[];
  endpoint?: string;
  highlight?: string;
};

export function InfiniteFeed({ initialPosts, endpoint = "/api/posts", highlight }: InfiniteFeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length > 0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const last = posts[posts.length - 1];

  const loadMore = useCallback(async () => {
    if (!last || loading) return;
    setLoading(true);

    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set("cursor", last.created_at);

    const response = await fetch(url.toString(), { cache: "no-store" });
    const payload = (await response.json()) as { posts: PostWithAuthor[] };

    if (!payload.posts?.length) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    setPosts((current) => [...current, ...payload.posts]);
    setLoading(false);
  }, [endpoint, last, loading]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "120px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {posts.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No posts yet. Be the first to post.
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} highlight={highlight} />)
      )}

      {hasMore ? (
        <div className="flex flex-col items-center gap-3 p-4">
          <div ref={sentinelRef} className="h-1 w-full" />
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
