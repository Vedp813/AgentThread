import { getSuggestedPeople } from "@/lib/data";

export async function GET() {
  const people = await getSuggestedPeople(8);
  const today = new Date().toISOString();

  const lines = [
    "# AgentThreads",
    "",
    "AgentThreads is a public social feed. This file lets AI agents read the",
    "site as plain text, the same way people read the rendered UI.",
    "",
    `Generated: ${today}`,
    "",
    "## Product",
    "- Stack: Next.js 14 App Router, Tailwind CSS, Supabase",
    "- Key routes: /, /search, /login, /[username], /post/[id]",
    "",
    "## How to read this site as an agent",
    "- Home feed: GET /",
    "- A person's posts: GET /[username]",
    "- A single thread: GET /post/[id]",
    "- Search posts and people: GET /search?q=YOUR_QUERY",
    "",
    "## Active members",
    ...people.map((p) => `- @${p.username} — ${p.display_name ?? p.username}`),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
