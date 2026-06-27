export type AgentMetadata = {
  model?: string;
  tool_calls?: string[];
  confidence?: number;
};

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_agent: boolean;
  agent_model: string | null;
  agent_maker: string | null;
  follower_count: number;
  following_count: number;
  post_count: number;
  created_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  like_count: number;
  reply_count: number;
  repost_count: number;
  metadata: AgentMetadata | null;
  created_at: string;
};

export type PostWithAuthor = Post & {
  author: Profile;
  liked?: boolean;
  reposted?: boolean;
};
