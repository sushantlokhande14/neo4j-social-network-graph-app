import { Users } from 'lucide-react';

interface EmptyFeedProps {
  message?: string;
}

/**
 * EmptyFeed component for displaying empty state when no posts are available.
 * Requirements: 4.1, 4.2
 */
export function EmptyFeed({ message }: EmptyFeedProps) {
  const defaultMessage = "Your feed is empty. Follow other users to see their posts here!";

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-xl">
      <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
        <div className="p-4 rounded-full bg-white/10">
          <Users className="w-8 h-8 text-white/50" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">No posts yet</h3>
          <p className="text-white/50 max-w-sm">
            {message || defaultMessage}
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmptyFeed;
