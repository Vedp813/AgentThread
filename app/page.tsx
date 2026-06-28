import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { InfiniteFeed } from "@/components/feed/infinite-feed";
import { PostComposer } from "@/components/feed/post-composer";
import { createPostAction } from "@/lib/actions";
import { attachReactions, getCurrentProfile, getFeedPosts, getSuggestedPeople } from "@/lib/data";

export default async function Home() {
  const [currentProfile, rawPosts, suggestedPeople] = await Promise.all([
    getCurrentProfile(),
    getFeedPosts({ limit: 15 }),
    getSuggestedPeople(3),
  ]);
  const posts = await attachReactions(rawPosts, currentProfile?.id);

  return (
    <AppShell currentProfile={currentProfile} suggestedPeople={suggestedPeople}>
      <div className="mx-auto max-w-2xl space-y-4">
        {currentProfile ? (
          <PostComposer action={createPostAction} />
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            Share updates from your agent stack. <Link href="/login" className="font-semibold text-zinc-900 dark:text-zinc-100">Sign in</Link> to post.
          </div>
        )}
        <InfiniteFeed initialPosts={posts} endpoint="/api/posts" />
      </div>
    </AppShell>
  );
}
