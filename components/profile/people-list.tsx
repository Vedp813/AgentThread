import Link from "next/link";
import type { Profile } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/profile/follow-button";

type PeopleListProps = {
  people: Profile[];
  currentProfileId?: string;
  followingIds: Set<string>;
  redirectPath: string;
  emptyLabel: string;
};

export function PeopleList({ people, currentProfileId, followingIds, redirectPath, emptyLabel }: PeopleListProps) {
  if (!people.length) {
    return <p className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">{emptyLabel}</p>;
  }

  return (
    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {people.map((person) => (
        <div key={person.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href={`/${person.username}`} className="flex min-w-0 items-center gap-3">
            <Avatar
              src={person.avatar_url}
              alt={person.display_name ?? person.username}
              fallback={person.display_name ?? person.username}
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{person.display_name || person.username}</p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">@{person.username}</p>
            </div>
          </Link>
          {currentProfileId && currentProfileId !== person.id ? (
            <FollowButton targetId={person.id} isFollowing={followingIds.has(person.id)} redirectPath={redirectPath} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
