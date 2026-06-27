import { toggleFollowAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function FollowButton({
  targetId,
  isFollowing,
  redirectPath,
}: {
  targetId: string;
  isFollowing: boolean;
  redirectPath: string;
}) {
  return (
    <form action={toggleFollowAction}>
      <input type="hidden" name="target_id" value={targetId} />
      <input type="hidden" name="redirect_path" value={redirectPath} />
      <Button type="submit" variant={isFollowing ? "outline" : "default"}>
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </form>
  );
}
