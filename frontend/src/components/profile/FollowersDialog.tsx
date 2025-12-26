import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  getFollowing,
  getFollowingForUser,
  getFollowersForUser,
  followUser,
  unfollowUser,
  type ProfileResponse,
} from '@/lib/api';
import { useAuth } from '@/providers/AuthContext';

export type FollowersDialogType = 'followers' | 'following';

interface FollowersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: FollowersDialogType;
  userId: string;
  onFollowChange?: (delta: number) => void;
}

export function FollowersDialog({
  open,
  onOpenChange,
  type,
  userId,
  onFollowChange,
}: FollowersDialogProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ProfileResponse[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    const fetchUsers =
      type === 'followers'
        ? () => getFollowersForUser(userId)
        : () => getFollowingForUser(userId);

    Promise.all([fetchUsers(), getFollowing()])
      .then(([userList, followingList]) => {
        setUsers(userList);
        setFollowing(followingList.map((u) => u.id));
      })
      .catch((err) => console.error(`Failed to load ${type}:`, err))
      .finally(() => setLoading(false));
  }, [open, type, userId]);

  const handleFollow = async (targetId: string) => {
    await followUser(targetId);
    setFollowing([...following, targetId]);
    onFollowChange?.(1);
  };

  const handleUnfollow = async (targetId: string) => {
    await unfollowUser(targetId);
    setFollowing(following.filter((id) => id !== targetId));
    onFollowChange?.(-1);
  };

  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-white/50 py-8">
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Link
                  to={`/profile/${user.username}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 flex-1"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`/avatars/${user.avatar}.svg`} />
                    <AvatarFallback>{user.name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-white/50">@{user.username}</span>
                  </div>
                </Link>
                {currentUser?.id !== user.id &&
                  (following.includes(user.id) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-400"
                      onClick={() => handleUnfollow(user.id)}
                    >
                      Unfollow
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-white/90"
                      onClick={() => handleFollow(user.id)}
                    >
                      Follow
                    </Button>
                  ))}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FollowersDialog;
