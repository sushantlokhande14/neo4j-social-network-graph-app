import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';
import { useApiClient } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import { Post } from '@/components/feed';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { FollowersDialog, type FollowersDialogType } from '@/components/profile/FollowersDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { updateProfile, followUser, unfollowUser, getFollowing, getMutualConnections } from '@/lib/api';
import type { ProfileResponse, ProfileUpdateRequest } from '@/lib/api';

interface ProfileUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
}

/**
 * ProfilePage component for displaying user profiles.
 * Requirements: 6.1, 6.3, 6.4, 6.5, UC-8
 */
export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const api = useApiClient();
  const { toast } = useToast();
  const { posts, setCurrentProfile } = useAppStore();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Dialog state for EditProfileDialog (UC-4)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Dialog state for FollowersDialog (UC-7)
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followersDialogType, setFollowersDialogType] = useState<FollowersDialogType>('followers');
  
  // Follow state for other users' profiles (UC-5/6)
  const [isFollowing, setIsFollowing] = useState(false);

  // Mutual connections state (UC-8)
  const [mutualConnections, setMutualConnections] = useState<ProfileResponse[]>([]);
  const [mutualLoading, setMutualLoading] = useState(false);

  // Fetch user profile from backend by username
  const fetchProfile = useCallback(async () => {
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      const [profile, followingList] = await Promise.all([
        api.get<ProfileResponse>(`/api/profile/by-username/${username}`),
        user ? getFollowing() : Promise.resolve([]),
      ]);
      
      setProfileUser({
        id: profile.id,
        name: profile.name,
        username: profile.username,
        avatar: `/avatars/${profile.avatar}.svg`,
        bio: profile.bio,
        followersCount: profile.followers_count,
        followingCount: profile.following_count,
      });
      
      // Check if current user is following this profile
      setIsFollowing(followingList.some((u) => u.id === profile.id));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  }, [username, api, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isCurrentUser = user?.id === profileUser?.id;
  const userPosts = posts.filter((post) => post.author.username === username);

  // Fetch mutual connections when viewing someone else's profile (UC-8)
  useEffect(() => {
    const loadMutualConnections = async () => {
      if (!profileUser || !user || isCurrentUser) {
        setMutualConnections([]);
        return;
      }

      try {
        setMutualLoading(true);
        const mutuals = await getMutualConnections(profileUser.id);
        setMutualConnections(mutuals);
      } catch (error) {
        console.error('Error fetching mutual connections:', error);
        setMutualConnections([]);
      } finally {
        setMutualLoading(false);
      }
    };

    loadMutualConnections();
  }, [profileUser, user, isCurrentUser]);

  // Handle profile save (UC-4)
  const handleProfileSave = async (updatedProfile: ProfileUpdateRequest) => {
    if (!user) return;
    
    const response = await updateProfile(user.id, updatedProfile);
    
    // Update local state, preserving follower/following counts
    setProfileUser((prev) => ({
      id: response.id,
      name: response.name,
      username: response.username,
      avatar: `/avatars/${response.avatar}.svg`,
      bio: response.bio,
      followersCount: prev?.followersCount ?? 0,
      followingCount: prev?.followingCount ?? 0,
    }));
    
    // Update shared store so FloatingDock reflects the change
    setCurrentProfile({
      id: response.id,
      name: response.name,
      username: response.username,
      avatar: response.avatar,
      bio: response.bio || '',
    });
    
    setIsEditDialogOpen(false);
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!profileUser) return <div className="p-4">User not found</div>;

  return (
    <>
      <header className="sticky top-0 z-10 bg-black/20 backdrop-blur-md border-b border-white/10 px-4 py-1 flex items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white/10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">{profileUser.name}</h1>
          <span className="text-sm text-white/50">{userPosts.length} posts</span>
        </div>
      </header>

      <div className="relative">
        <div className="h-48 bg-white/10" /> {/* Banner */}
        <div className="absolute -bottom-16 left-4">
          <Avatar className="w-32 h-32 border-4 border-black">
            <AvatarImage src={profileUser.avatar} />
            <AvatarFallback>{profileUser.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex justify-end px-4 py-3">
        {isCurrentUser ? (
          <Button
            variant="outline"
            className="rounded-full font-bold border-white/30 hover:bg-white/10"
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit profile
          </Button>
        ) : isFollowing ? (
          <Button
            variant="outline"
            className="rounded-full font-bold border-white/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-400"
            onClick={async () => {
              await unfollowUser(profileUser.id);
              setIsFollowing(false);
              setProfileUser((prev) =>
                prev ? { ...prev, followersCount: prev.followersCount - 1 } : prev
              );
            }}
          >
            Unfollow
          </Button>
        ) : (
          <Button
            className="rounded-full font-bold bg-white text-black hover:bg-white/90"
            onClick={async () => {
              await followUser(profileUser.id);
              setIsFollowing(true);
              setProfileUser((prev) =>
                prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev
              );
            }}
          >
            Follow
          </Button>
        )}
      </div>

      <div className="px-4 mt-4 flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-bold">{profileUser.name}</h2>
          <span className="text-white/50">@{profileUser.username}</span>
        </div>

        {profileUser.bio && <p>{profileUser.bio}</p>}

        <div className="flex gap-4 text-sm">
          <div
            className="hover:underline cursor-pointer"
            onClick={() => {
              setFollowersDialogType('following');
              setFollowersDialogOpen(true);
            }}
          >
            <span className="font-bold text-white">{profileUser.followingCount}</span>{' '}
            <span className="text-white/50">Following</span>
          </div>
          <div
            className="hover:underline cursor-pointer"
            onClick={() => {
              setFollowersDialogType('followers');
              setFollowersDialogOpen(true);
            }}
          >
            <span className="font-bold text-white">{profileUser.followersCount}</span>{' '}
            <span className="text-white/50">Followers</span>
          </div>
        </div>

        {/* UC-8: Mutual Connections */}
        {!isCurrentUser && (
          <div className="mt-2">
            <h3 className="text-sm font-semibold text-white">Mutual connections</h3>
            {mutualLoading ? (
              <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/60"></div>
                <span>Loading mutual connections…</span>
              </div>
            ) : mutualConnections.length === 0 ? (
              <p className="text-white/50 text-sm mt-1">
                No mutual connections yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {mutualConnections.slice(0, 3).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => navigate(`/profile/${u.username}`)}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-sm transition-colors"
                  >
                    <Avatar className="w-6 h-6 border border-white/20">
                      <AvatarImage src={`/avatars/${u.avatar}.svg`} />
                      <AvatarFallback>{u.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-white">{u.name}</span>
                    <span className="text-white/50 text-xs">@{u.username}</span>
                  </button>
                ))}
                {mutualConnections.length > 3 && (
                  <span className="text-white/60 text-xs mt-1">
                    +{mutualConnections.length - 3} more mutual connections
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex border-b border-white/10 mt-4">
        <div className="flex-1 hover:bg-white/10 transition-colors cursor-pointer py-4 flex justify-center relative">
          <span className="font-bold">Posts</span>
          <div className="absolute bottom-0 w-14 h-1 bg-sky-500 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col">
        {userPosts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>

      {/* Edit Profile Dialog */}
      {profileUser && (
        <EditProfileDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          currentProfile={{
            name: profileUser.name,
            username: profileUser.username,
            bio: profileUser.bio || '',
            avatar: profileUser.avatar.replace('/avatars/', '').replace('.svg', ''),
          }}
          onSave={handleProfileSave}
        />
      )}

      {/* Followers/Following Dialog */}
      {profileUser && (
        <FollowersDialog
          open={followersDialogOpen}
          onOpenChange={setFollowersDialogOpen}
          type={followersDialogType}
          userId={profileUser.id}
          onFollowChange={(delta) => {
            setProfileUser((prev) =>
              prev ? { ...prev, followingCount: prev.followingCount + delta } : prev
            );
          }}
        />
      )}
    </>
  );
}

export default ProfilePage;

