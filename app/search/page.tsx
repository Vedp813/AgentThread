import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { PostCard } from "@/components/feed/post-card";
import { FollowButton } from "@/components/profile/follow-button";
import {
  getCurrentProfile,
  getFollowingIds,
  getSuggestedPeople,
  searchPeople,
  searchPosts,
} from "@/lib/data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; tab?: string };
}) {
  const term = (searchParams.q ?? "").trim();
  const tab = searchParams.tab === "people" ? "people" : "posts";

  const [currentProfile, suggestedPeople, posts, people] = await Promise.all([
    getCurrentProfile(),
    getSuggestedPeople(3),
    tab === "posts" && term ? searchPosts(term) : Promise.resolve([]),
    tab === "people" && term ? searchPeople(term) : Promise.resolve([]),
  ]);
  const followingIds = currentProfile
    ? await getFollowingIds(currentProfile.id)
    : new Set<string>();

  return (
    <AppShell currentProfile={currentProfile} suggestedPeople={suggestedPeople}>
      <div className="mx-auto max-w-3xl space-y-4">
        <Card className="p-4">
          <form action="/search" className="space-y-3">
            <Input
              name="q"
              placeholder="Search posts, people, models..."
              defaultValue={term}
              autoFocus
            />
            <div className="flex gap-2 text-sm">
              <Link
                href={`/search?q=${encodeURIComponent(term)}&tab=posts`}
                className={tab === "posts" ? "rounded-full bg-zinc-900 px-4 py-2 text-white" : "rounded-full bg-zinc-100 px-4 py-2 text-zinc-600"}
              >
                Posts
              </Link>
              <Link
                href={`/search?q=${encodeURIComponent(term)}&tab=people`}
                className={tab === "people" ? "rounded-full bg-zinc-900 px-4 py-2 text-white" : "rounded-full bg-zinc-100 px-4 py-2 text-zinc-600"}
              >
                People
              </Link>
            </div>
          </form>
        </Card>

        {!term ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-zinc-600">Try: &quot;reasoning chain&quot;, &quot;gpt&quot;, &quot;tool calls&quot;, &quot;safety evals&quot;</p>
          </Card>
        ) : null}

        {tab === "posts" && term ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {posts.length ? (
              posts.map((post) => <PostCard key={post.id} post={post} highlight={term} />)
            ) : (
              <p className="p-8 text-center text-sm text-zinc-500">No post matches for &quot;{term}&quot;.</p>
            )}
          </div>
        ) : null}

        {tab === "people" && term ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {people.length ? (
              people.map((person) => (
                <Card key={person.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/${person.username}`} className="flex items-center gap-3">
                      <Avatar
                        src={person.avatar_url}
                        alt={person.display_name ?? person.username}
                        fallback={person.display_name ?? person.username}
                      />
                      <div>
                        <p className="font-semibold text-zinc-900">{person.display_name || person.username}</p>
                        <p className="text-xs text-zinc-500">@{person.username}</p>
                      </div>
                    </Link>
                    {currentProfile && currentProfile.id !== person.id ? (
                      <FollowButton
                        targetId={person.id}
                        isFollowing={followingIds.has(person.id)}
                        redirectPath={`/search?q=${encodeURIComponent(term)}&tab=people`}
                      />
                    ) : null}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="col-span-full p-8 text-center text-sm text-zinc-500">No people found for &quot;{term}&quot;.</Card>
            )}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
