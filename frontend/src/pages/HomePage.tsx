import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-user';
import { Feed, ComposePost } from '@/components/feed';
import { fetchFeed } from '@/lib/api';
import { useAppStore } from '@/lib/store';

/**
 * HomePage component displaying the main feed.
 * Requirements: 2.1, 2.3, 2.4, 5.1, 5.2, 5.3, 5.4
 */
export function HomePage() {
  const { user, isLoading } = useCurrentUser({ redirect: true });
  const { setFeedPosts, setFeedLoading, setFeedError } = useAppStore();

  /**
   * Fetch feed posts on mount.
   * Requirements: 2.1, 2.3, 2.4
   */
  useEffect(() => {
    if (!user) return;

    const loadFeed = async () => {
      setFeedLoading(true);
      setFeedError(null);

      try {
        const response = await fetchFeed();
        setFeedPosts(response.posts);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load feed';
        setFeedError(message);
      } finally {
        setFeedLoading(false);
      }
    };

    loadFeed();
  }, [user, setFeedPosts, setFeedLoading, setFeedError]);

  if (isLoading || !user) return null;

  return (
    <>
      <header className="sticky top-0 z-10 bg-black/20 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <h1 className="text-xl font-bold">Home</h1>
      </header>
      <ComposePost />
      <Feed />
    </>
  );
}

export default HomePage;
