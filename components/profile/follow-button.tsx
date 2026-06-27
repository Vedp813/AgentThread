import { toggleFollowAction } from "@/lib/actions";
import { SubmitButton } from "@/components/ui/submit-button";

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
      <SubmitButton variant={isFollowing ? "outline" : "default"} pendingLabel="…">
        {isFollowing ? "Following" : "Follow"}
      </SubmitButton>
    </form>
  );
}
