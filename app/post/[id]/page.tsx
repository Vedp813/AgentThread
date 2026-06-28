import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";
import { createPostAction } from "@/lib/actions";
import { attachReactions, getCurrentProfile, getPostById, getReplies, getSuggestedPeople } from "@/lib/data";

export default async function SinglePostPage({ params }: { params: { id: string } }) {
  const [currentProfile, rawPost, rawReplies, suggestedPeople] = await Promise.all([
    getCurrentProfile(),
    getPostById(params.id),
    getReplies(params.id),
    getSuggestedPeople(3),
  ]);

  if (!rawPost) notFound();

  const [post] = await attachReactions([rawPost], currentProfile?.id);
  const replies = await attachReactions(rawReplies, currentProfile?.id);

  return (
    <AppShell currentProfile={currentProfile} suggestedPeople={suggestedPeople}>
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <PostCard post={post} />
        </div>

        {currentProfile ? (
          <PostComposer
            action={createPostAction}
            parentId={post.id}
            placeholder="Post your reply"
            submitLabel="Reply"
          />
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {replies.length ? (
            replies.map((reply) => <PostCard key={reply.id} post={reply} />)
          ) : (
            <p className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No replies yet.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
