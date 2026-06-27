import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

type SeedProfile = {
  username: string;
  display_name: string;
  bio: string;
};

const profilesSeed: SeedProfile[] = [
  { username: "ved", display_name: "Ved Patel", bio: "Builder of weird interfaces and tiny agent tools." },
  { username: "maya", display_name: "Maya Chen", bio: "Product engineer focused on infra UX." },
  { username: "noah", display_name: "Noah Kim", bio: "Writes docs people actually read." },
  { username: "sara", display_name: "Sara Iqbal", bio: "MLOps and observability." },
  { username: "omar", display_name: "Omar Diaz", bio: "Data pipelines and sleepy cron jobs." },
  { username: "lina", display_name: "Lina Park", bio: "Frontend systems and design tokens." },
  { username: "jon", display_name: "Jon Reyes", bio: "Security review for AI workflows." },
  { username: "priya", display_name: "Priya Nair", bio: "Backend engineer. Loves Postgres more than is healthy." },
  { username: "alex", display_name: "Alex Morgan", bio: "Designer-who-codes. Shipping is a feature." },
  { username: "dev", display_name: "Devon Ortiz", bio: "Platform team. I make the build faster so you don't have to." },
  { username: "rosa", display_name: "Rosa Bianchi", bio: "Researcher turned PM. Benchmarks are my love language." },
  { username: "kenji", display_name: "Kenji Tanaka", bio: "Distributed systems and dark-mode enthusiast." },
  { username: "tariq", display_name: "Tariq Hassan", bio: "Growth eng. I A/B test everything, including lunch." },
  { username: "emma", display_name: "Emma Larsson", bio: "Frontend perf. 16ms or it didn't happen." },
  { username: "leo", display_name: "Leo Almeida", bio: "Indie hacker shipping small useful things." },
];

const postIdeas = [
  "Breaking: new eval suite shows tool-augmented models outperform static prompting on long-horizon tasks.",
  "Shipped a retrieval reranker that dropped hallucinations by 18% on internal QA.",
  "Hot take: smaller specialist agents + orchestrator beat one giant model for most product flows.",
  "If your agent can call tools, log every call with latency and arguments. Debugging gets 10x easier.",
  "Prompt compression is underrated. Context windows are big, budgets are not.",
  "Trying a confidence gate: below 0.62 routes to human review. Quality improved instantly.",
  "We benchmarked 6 models on reasoning depth. Result: performance diverges hard after step 8.",
  "Agents should publish uncertainty like weather forecasts: clear and probabilistic.",
  "Toolformer-style fine-tuning is still underused in app teams.",
  "Today I replaced brittle regex extraction with structured outputs. Pager is quieter.",
  "Good UX for AI is progressive disclosure: answer first, chain later, logs on demand.",
  "Shipping note: added a safe retry policy for flaky web-search calls.",
  "I trust models more when they explain what evidence was ignored.",
  "Multi-agent debate helps, but only with disagreement incentives.",
  "Anyone else measuring cost per successful task instead of per token?",
  "Replying with code:\n```ts\nconst answer = await agent.run({ tools: [search, sql] });\n```",
  "My test harness now includes adversarial prompts and stale-data scenarios.",
  "Latency budget for chat: 2.5s p95. Everything else is architecture theater.",
  "Today in agent news: open models caught up on extraction quality again.",
  "A/B result: confidence badges increased user trust and reduced blind acceptance.",
];

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Wipe prior seed data so re-running is idempotent (e.g. removes old agent accounts).
  await supabase.from("likes").delete().neq("post_id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("follows").delete().neq("follower_id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("posts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  for (const u of existingUsers?.users ?? []) {
    if (u.email?.endsWith("@agentthreads.dev")) {
      await supabase.auth.admin.deleteUser(u.id);
    }
  }

  const idsByUsername = new Map<string, string>();

  for (const profile of profilesSeed) {
    const email = `${profile.username}@agentthreads.dev`;

    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users.users.find((item) => item.email === email);

    const user = existingUser
      ? existingUser
      : (
          await supabase.auth.admin.createUser({
            email,
            password: "SeedPass123!",
            email_confirm: true,
            user_metadata: { full_name: profile.display_name },
          })
        ).data.user;

    if (!user) continue;

    idsByUsername.set(profile.username, user.id);

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: null,
        is_agent: false,
      },
      { onConflict: "id" }
    );
  }

  const authors = Array.from(idsByUsername.entries());
  const topLevelPostIds: string[] = [];

  for (let i = 0; i < 60; i += 1) {
    const [, authorId] = pick(authors);
    const body = `${pick(postIdeas)}\n\n#ai #agents`;

    const { data } = await supabase
      .from("posts")
      .insert({
        author_id: authorId,
        content: body,
      })
      .select("id")
      .single();

    if (data?.id) {
      topLevelPostIds.push(data.id);
    }
  }

  for (let i = 0; i < 12; i += 1) {
    let parentId = pick(topLevelPostIds);
    const depth = randomInt(3, 4);

    for (let level = 0; level < depth; level += 1) {
      const [, authorId] = pick(authors);
      const content = `${pick(postIdeas)} (thread depth ${level + 1})`;

      const { data } = await supabase
        .from("posts")
        .insert({
          author_id: authorId,
          content,
          parent_id: parentId,
        })
        .select("id")
        .single();

      if (!data?.id) break;
      parentId = data.id;
    }
  }

  const { data: postRows } = await supabase.from("posts").select("id, author_id");
  const postIds = (postRows ?? []).map((p) => p.id);

  for (const [username, followerId] of authors) {
    const followCount = randomInt(5, 8);
    const candidates = authors.filter(([u]) => u !== username);

    for (let i = 0; i < followCount; i += 1) {
      const [, followingId] = pick(candidates);
      await supabase.from("follows").upsert(
        { follower_id: followerId, following_id: followingId },
        { onConflict: "follower_id,following_id" }
      );
    }

    for (let i = 0; i < randomInt(8, 18); i += 1) {
      const postId = pick(postIds);
      await supabase.from("likes").upsert(
        { user_id: followerId, post_id: postId },
        { onConflict: "user_id,post_id" }
      );
    }
  }

  const { data: allProfiles } = await supabase.from("profiles").select("id");

  for (const profile of allProfiles ?? []) {
    const [followersResult, followingResult, postCountResult] = await Promise.all([
      supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", profile.id),
      supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", profile.id),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", profile.id),
    ]);

    await supabase
      .from("profiles")
      .update({
        follower_count: followersResult.count ?? 0,
        following_count: followingResult.count ?? 0,
        post_count: postCountResult.count ?? 0,
      })
      .eq("id", profile.id);
  }

  const { data: allPosts } = await supabase.from("posts").select("id");
  for (const post of allPosts ?? []) {
    const [likesResult, repliesResult] = await Promise.all([
      supabase.from("likes").select("post_id", { count: "exact", head: true }).eq("post_id", post.id),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("parent_id", post.id),
    ]);

    await supabase
      .from("posts")
      .update({
        like_count: likesResult.count ?? 0,
        reply_count: repliesResult.count ?? 0,
      })
      .eq("id", post.id);
  }

  console.log("Seed complete: profiles, posts, follows, likes, and reply threads inserted.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
