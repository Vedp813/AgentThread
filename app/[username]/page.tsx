import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/profile/follow-button";
import { PostCard } from "@/components/feed/post-card";
import {
  getCurrentProfile,
  getProfileByUsername,
  getSuggestedPeople,
  getPostsByUsername,
  isFollowing,
} from "@/lib/data";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab === "replies" || searchParams.tab === "reposts" ? searchParams.tab : "posts";

  const [currentProfile, profile, suggestedPeople] = await Promise.all([
    getCurrentProfile(),
    getProfileByUsername(params.username),
    getSuggestedPeople(3),
  ]);

  if (!profile) notFound();

  const [posts, following] = await Promise.all([
    getPostsByUsername(profile.username, tab as "posts" | "replies" | "reposts"),
    currentProfile ? isFollowing(currentProfile.id, profile.id) : Promise.resolve(false),
  ]);

  return (
    <AppShell currentProfile={currentProfile} suggestedPeople={suggestedPeople}>
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="h-36 bg-gradient-to-r from-cyan-200 via-amber-100 to-rose-200" />
        <div className="relative px-5 pb-5">
          <div className="-mt-12 flex items-end justify-between">
            <Avatar
              src={profile.avatar_url}
              alt={profile.display_name ?? profile.username}
              fallback={profile.display_name ?? profile.username}
              className="h-24 w-24 border-4 border-white"
            />
            {currentProfile && currentProfile.id !== profile.id ? (
              <FollowButton targetId={profile.id} isFollowing={following} redirectPath={`/${profile.username}`} />
            ) : null}
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-zinc-900">{profile.display_name || profile.username}</h1>
            <p className="text-zinc-500">@{profile.username}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{profile.bio || "No bio yet."}</p>
            <div className="mt-3 flex gap-6 text-sm text-zinc-600">
              <p><span className="font-semibold text-zinc-900">{profile.following_count}</span> Following</p>
              <p><span className="font-semibold text-zinc-900">{profile.follower_count}</span> Followers</p>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 px-4 py-2">
          <div className="flex gap-2 text-sm">
            <a href={`/${profile.username}?tab=posts`} className={tab === "posts" ? "rounded-full bg-zinc-900 px-4 py-2 text-white" : "rounded-full bg-zinc-100 px-4 py-2 text-zinc-600"}>Posts</a>
            <a href={`/${profile.username}?tab=replies`} className={tab === "replies" ? "rounded-full bg-zinc-900 px-4 py-2 text-white" : "rounded-full bg-zinc-100 px-4 py-2 text-zinc-600"}>Replies</a>
            <a href={`/${profile.username}?tab=reposts`} className={tab === "reposts" ? "rounded-full bg-zinc-900 px-4 py-2 text-white" : "rounded-full bg-zinc-100 px-4 py-2 text-zinc-600"}>Reposts</a>
          </div>
        </div>

        {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <p className="p-8 text-center text-sm text-zinc-500">No posts to show.</p>}
      </div>
    </AppShell>
  );
}
