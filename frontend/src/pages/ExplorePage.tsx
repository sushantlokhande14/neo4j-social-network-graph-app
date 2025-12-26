import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  getFollowing, 
  followUser, 
  unfollowUser, 
  searchUsers, 
  getPopularUsers 
} from "@/lib/api";
import type { ProfileResponse } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

const USERS_PER_PAGE = 20;

export function ExplorePage() {
  const [users, setUsers] = useState<ProfileResponse[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Load initial data (popular users + following list)
  useEffect(() => {
    async function loadData() {
      try {
        const popularUsers = await getPopularUsers();
        const followingList = await getFollowing();

        setUsers(popularUsers);
        setFollowing(followingList.map((u) => u.id));
      } catch (err) {
        console.error("Failed to load explore data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle searching
  useEffect(() => {
    async function performSearch() {
      if (!searchTerm.trim()) {
        // Load popular users if search is empty
        try {
          const popularUsers = await getPopularUsers();
          setUsers(popularUsers);
          setIsSearching(false);
        } catch (err) {
          console.error("Failed to reload popular users:", err);
          setIsSearching(false);
        }
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await searchUsers(searchTerm);
        setUsers(searchResults);
      } catch (err) {
        console.error("Failed to search users:", err);
      } finally {
        setIsSearching(false);
      }
    }

    const timeoutId = setTimeout(() => performSearch(), 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Follow user
  const handleFollow = async (targetId: string) => {
    try {
      await followUser(targetId);
      setFollowing([...following, targetId]);

      setUsers(users.map((u) =>
        u.id === targetId ? { ...u, followers_count: u.followers_count + 1 } : u
      ));
    } catch (err) {
      console.error("Failed to follow user:", err);
    }
  };

  // Unfollow user
  const handleUnfollow = async (targetId: string) => {
    try {
      await unfollowUser(targetId);
      setFollowing(following.filter((id) => id !== targetId));

      setUsers(users.map((u) =>
        u.id === targetId ? { ...u, followers_count: u.followers_count - 1 } : u
      ));
    } catch (err) {
      console.error("Failed to unfollow user:", err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, startIndex + USERS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render loading
  if (loading) {
    return <p className="text-white p-4">Loading users...</p>;
  }

  return (
    <div className="text-white space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Explore Users</h1>
        <p className="text-white/50 text-sm">
          {users.length} users · Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search users by name or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>

      {/* Searching status */}
      {isSearching && (
        <p className="text-white/50 p-4">Searching...</p>
      )}

      {/* No users */}
      {!isSearching && users.length === 0 && (
        <p className="text-white/50 p-4">
          {searchTerm.trim()
            ? "No users found matching your search."
            : "No users found."}
        </p>
      )}

      {/* Show Popular section label if not searching */}
      {!searchTerm.trim() && !isSearching && users.length > 0 && (
        <h2 className="text-lg font-semibold mt-6">Popular Users</h2>
      )}

      {/* User List with Pagination */}
      {paginatedUsers.map((user) => (
        <div
          key={user.id}
          className="bg-white/10 p-4 rounded-xl flex items-center justify-between border border-white/10"
        >
          <Link to={`/profile/${user.username}`} className="flex-1">
            <p className="text-lg font-medium">{user.name}</p>
            <p className="text-white/50">@{user.username}</p>
            <p className="text-sm text-white/40 mt-1">
              {user.followers_count} followers
            </p>
          </Link>

          {following.includes(user.id) ? (
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={() => handleUnfollow(user.id)}
            >
              Unfollow
            </Button>
          ) : (
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => handleFollow(user.id)}
            >
              Follow
            </Button>
          )}
        </div>
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-white/10 border-white/20 hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 2
              )
              .map((page, idx, arr) => {
                const showEllipsisBefore =
                  idx > 0 && page - arr[idx - 1] > 1;

                return (
                  <span key={page} className="flex items-center">
                    {showEllipsisBefore && (
                      <span className="px-2 text-white/50">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className={
                        currentPage === page
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-white/10 border-white/20 hover:bg-white/20"
                      }
                    >
                      {page}
                    </Button>
                  </span>
                );
              })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-white/10 border-white/20 hover:bg-white/20"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ExplorePage;
