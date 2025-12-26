import { useAppStore } from '@/lib/store';
import { Post } from './Post';
import { EmptyFeed } from './EmptyFeed';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle } from 'lucide-react';

/**
 * Feed component for displaying the list of posts.
 * Handles loading, error, and empty states.
 * Requirements: 1.2, 1.3, 2.4, 4.1, 5.1
 */
export function Feed() {
  const { posts, isLoadingFeed, feedError } = useAppStore();

  // Show loading spinner while fetching
  if (isLoadingFeed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Spinner className="w-8 h-8 text-white/50" />
        <p className="text-white/50">Loading your feed...</p>
      </div>
    );
  }

  // Show error message on failure
  if (feedError) {
    return (
      <div className="bg-red-500/10 backdrop-blur-md rounded-3xl p-8 border border-red-500/20 shadow-xl">
        <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
          <div className="p-4 rounded-full bg-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Failed to load feed</h3>
            <p className="text-white/50 max-w-sm">{feedError}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show EmptyFeed when posts array is empty
  if (posts.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}

export default Feed;
