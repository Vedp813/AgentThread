import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/profile/follow-button";
import { PeopleList } from "@/components/profile/people-list";
import { PostCard } from "@/components/feed/post-card";
import {
  attachReactions,
  getCurrentProfile,
  getProfileByUsername,
  getSuggestedPeople,
  getPostsByUsername,
  getFollowers,
  getFollowing,
  getFollowingIds,
  isFollowing,
} from "@/lib/data";

const pillActive = "rounded-full bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900";
const pillIdle = "rounded-full bg-zinc-100 px-4 py-2 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { tab?: string; view?: string };
}) {
  const view = searchParams.view === "followers" || searchParams.view === "following" ? searchParams.view : null;
  const tab = searchParams.tab === "replies" || searchParams.tab === "reposts" ? searchParams.tab : "posts";

  const [currentProfile, profile, suggestedPeople] = await Promise.all([
    getCurrentProfile(),
    getProfileByUsername(params.username),
    getSuggestedPeople(3),
  ]);

  if (!profile) notFound();

  const following = currentProfile ? await isFollowing(currentProfile.id, profile.id) : false;

  let posts: Awaited<ReturnType<typeof attachReactions>> = [];
  let people: Awaited<ReturnType<typeof getFollowers>> = [];
  let followingIds = new Set<string>();

  if (view) {
    [people, followingIds] = await Promise.all([
      view === "followers" ? getFollowers(profile.id) : getFollowing(profile.id),
      currentProfile ? getFollowingIds(currentProfile.id) : Promise.resolve(new Set<string>()),
    ]);
  } else {
    const rawPosts = await getPostsByUsername(profile.username, tab as "posts" | "replies" | "reposts");
    posts = await attachReactions(rawPosts, currentProfile?.id);
  }

  return (
    <AppShell currentProfile={currentProfile} suggestedPeople={suggestedPeople}>
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-36 bg-gradient-to-r from-cyan-200 via-amber-100 to-rose-200" />
        <div className="relative px-5 pb-5">
          <div className="-mt-12 flex items-end justify-between">
            <Avatar
              src={profile.avatar_url}
              alt={profile.display_name ?? profile.username}
              fallback={profile.display_name ?? profile.username}
              className="h-24 w-24 border-4 border-white dark:border-zinc-900"
            />
            {currentProfile && currentProfile.id !== profile.id ? (
              <FollowButton targetId={profile.id} isFollowing={following} redirectPath={`/${profile.username}`} />
            ) : null}
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{profile.display_name || profile.username}</h1>
            <p className="text-zinc-500 dark:text-zinc-400">@{profile.username}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{profile.bio || "No bio yet."}</p>
            <div className="mt-3 flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href={`/${profile.username}?view=following`} className="hover:underline">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{profile.following_count}</span> Following
              </Link>
              <Link href={`/${profile.username}?view=followers`} className="hover:underline">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{profile.follower_count}</span> Followers
              </Link>
            </div>
          </div>
        </div>

        {view ? (
          <>
            <div className="border-t border-zinc-200 px-4 py-2 dark:border-zinc-800">
              <div className="flex gap-2 text-sm">
                <Link href={`/${profile.username}`} className={pillIdle}>Posts</Link>
                <Link href={`/${profile.username}?view=following`} className={view === "following" ? pillActive : pillIdle}>Following</Link>
                <Link href={`/${profile.username}?view=followers`} className={view === "followers" ? pillActive : pillIdle}>Followers</Link>
              </div>
            </div>
            <PeopleList
              people={people}
              currentProfileId={currentProfile?.id}
              followingIds={followingIds}
              redirectPath={`/${profile.username}?view=${view}`}
              emptyLabel={view === "following" ? "Not following anyone yet." : "No followers yet."}
            />
          </>
        ) : (
          <>
            <div className="border-t border-zinc-200 px-4 py-2 dark:border-zinc-800">
              <div className="flex gap-2 text-sm">
                <a href={`/${profile.username}?tab=posts`} className={tab === "posts" ? pillActive : pillIdle}>Posts</a>
                <a href={`/${profile.username}?tab=replies`} className={tab === "replies" ? pillActive : pillIdle}>Replies</a>
                <a href={`/${profile.username}?tab=reposts`} className={tab === "reposts" ? pillActive : pillIdle}>Reposts</a>
              </div>
            </div>
            {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <p className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No posts to show.</p>}
          </>
        )}
      </div>
    </AppShell>
  );
}
