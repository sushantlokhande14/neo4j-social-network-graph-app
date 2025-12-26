import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFollowers, getFollowing, getSuggestedUsers, followUser, unfollowUser } from "@/lib/api";
import type { ProfileResponse } from "@/lib/api";
import { UserCard } from "@/components/UserCard";

export function ConnectionsPage() {
  const [followers, setFollowers] = useState<ProfileResponse[]>([]);
  const [following, setFollowing] = useState<ProfileResponse[]>([]);
  const [suggestions, setSuggestions] = useState<ProfileResponse[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConnections() {
      try {
        const f1 = await getFollowers();
        const f2 = await getFollowing();
        const s = await getSuggestedUsers();

        setFollowers(f1);
        setFollowing(f2);
        setSuggestions(s);
        setFollowingIds(f2.map((u) => u.id));
      } catch (err) {
        console.error("Failed to load connections:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConnections();
  }, []);

  const handleFollow = async (targetId: string) => {
    try {
      await followUser(targetId);
      setFollowingIds([...followingIds, targetId]);
      setSuggestions(suggestions.map((u) =>
        u.id === targetId ? { ...u, followers_count: u.followers_count + 1 } : u
      ));
    } catch (err) {
      console.error("Failed to follow user:", err);
    }
  };

  const handleUnfollow = async (targetId: string) => {
    try {
      await unfollowUser(targetId);
      setFollowingIds(followingIds.filter((id) => id !== targetId));
      setSuggestions(suggestions.map((u) =>
        u.id === targetId ? { ...u, followers_count: u.followers_count - 1 } : u
      ));
    } catch (err) {
      console.error("Failed to unfollow user:", err);
    }
  };

  if (loading) {
    return <p className="text-white p-4">Loading connections...</p>;
  }

  return (
    <div className="text-white space-y-6">
      <h1 className="text-2xl font-semibold">Connections</h1>

      {/* Following Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">You Follow</h2>

        {following.length === 0 ? (
          <p className="text-white/60">You're not following anyone.</p>
        ) : (
          <div className="space-y-3">
            {following.map((u) => (
              <div
                key={u.id}
                className="bg-white/10 p-4 rounded-xl flex items-center justify-between border border-white/10"
              >
                <Link to={`/profile/${u.username}`} className="flex-1">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-white/50 text-sm">@{u.username}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Followers Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Followers</h2>

        {followers.length === 0 ? (
          <p className="text-white/60">You don't have any followers yet.</p>
        ) : (
          <div className="space-y-3">
            {followers.map((u) => (
              <div
                key={u.id}
                className="bg-white/10 p-4 rounded-xl flex items-center justify-between border border-white/10"
              >
                <Link to={`/profile/${u.username}`} className="flex-1">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-white/50 text-sm">@{u.username}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Suggested Accounts Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Suggested Accounts</h2>
        {suggestions.length === 0 ? (
          <p className="text-white/60">No suggestions available. Try following more people!</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                isFollowing={followingIds.includes(u.id)}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ConnectionsPage;
