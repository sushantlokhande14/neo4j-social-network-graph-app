import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { ProfileResponse } from "@/lib/api";

interface UserCardProps {
  user: ProfileResponse;
  isFollowing: boolean;
  showFollowButton?: boolean;
  showFollowerCount?: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
}

export function UserCard({
  user,
  isFollowing,
  showFollowButton = true,
  showFollowerCount = true,
  onFollow,
  onUnfollow,
}: UserCardProps) {
  return (
    <div className="bg-white/10 p-4 rounded-xl flex items-center justify-between border border-white/10">
      <Link to={`/profile/${user.username}`} className="flex-1">
        <p className="text-lg font-medium">{user.name}</p>
        <p className="text-white/50">@{user.username}</p>
        {showFollowerCount && (
          <p className="text-sm text-white/40 mt-1">{user.followers_count} followers</p>
        )}
      </Link>

      {showFollowButton && (
        isFollowing ? (
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => onUnfollow?.(user.id)}
          >
            Unfollow
          </Button>
        ) : (
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => onFollow?.(user.id)}
          >
            Follow
          </Button>
        )
      )}
    </div>
  );
}
