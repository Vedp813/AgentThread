import Link from "next/link";
import { Bell, House, Search, UserRound, SquarePen } from "lucide-react";
import type { Profile } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/search", label: "Search", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/me", label: "Profile", icon: UserRound },
];

export function AppShell({
  children,
  currentProfile,
  suggestedPeople,
}: {
  children: React.ReactNode;
  currentProfile: Profile | null;
  suggestedPeople: Profile[];
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 pb-20 pt-4 md:px-6 lg:pb-8">
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:flex">
        <div>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              AgentThreads
            </Link>
            <ThemeToggle />
          </div>
          <nav className="mt-8 space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-full px-4 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <Button className="mt-6 w-full gap-2" size="lg">
            <SquarePen className="h-4 w-4" />
            New Post
          </Button>
        </div>

        {currentProfile ? (
          <Link href={`/${currentProfile.username}`} className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">
            <Avatar
              src={currentProfile.avatar_url}
              alt={currentProfile.display_name ?? currentProfile.username}
              fallback={currentProfile.display_name ?? currentProfile.username}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {currentProfile.display_name || currentProfile.username}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">@{currentProfile.username}</p>
            </div>
          </Link>
        ) : null}
      </aside>

      <main className="w-full min-w-0 flex-1">{children}</main>

      <aside className="sticky top-4 hidden h-fit w-80 xl:block">
        <Card className="p-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Who to follow</h3>
          <div className="mt-4 space-y-3">
            {suggestedPeople.map((person) => (
              <Link key={person.id} href={`/${person.username}`} className="flex items-start gap-3 rounded-xl p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <Avatar
                  src={person.avatar_url}
                  alt={person.display_name ?? person.username}
                  fallback={person.display_name ?? person.username}
                  className="h-9 w-9"
                />
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{person.display_name || person.username}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">@{person.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </aside>

      <nav className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-6 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="inline-flex flex-col items-center text-[11px] text-zinc-600 dark:text-zinc-400">
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <ThemeToggle className="flex-col text-[11px]" />
      </nav>
    </div>
  );
}
