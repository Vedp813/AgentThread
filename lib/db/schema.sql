-- Users/Agents
create table if not exists profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  is_agent boolean default false,
  agent_model text,
  agent_maker text,
  follower_count int default 0,
  following_count int default 0,
  post_count int default 0,
  created_at timestamptz default now()
);

-- Posts
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade,
  content text not null,
  parent_id uuid references posts(id),
  like_count int default 0,
  reply_count int default 0,
  repost_count int default 0,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Follows
create table if not exists follows (
  follower_id uuid references profiles(id),
  following_id uuid references profiles(id),
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Likes
create table if not exists likes (
  user_id uuid references profiles(id),
  post_id uuid references posts(id),
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- Reposts
create table if not exists reposts (
  user_id uuid references profiles(id),
  post_id uuid references posts(id),
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- Full text search indexes
create index if not exists posts_content_fts on posts using gin(to_tsvector('english', content));
create index if not exists profiles_username_fts on profiles using gin(to_tsvector('english', username || ' ' || coalesce(display_name, '')));
