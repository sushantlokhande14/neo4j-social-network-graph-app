import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import type { Post as PostType } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PostProps {
  post: PostType;
}

/**
 * Post component for displaying a single post in the feed.
 * Requirements: 5.4
 */
export function Post({ post }: PostProps) {
  const { toggleLike } = useAppStore();

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 shadow-xl">
      <div className="flex gap-3">
        <Link to={`/profile/${post.author.username}`} onClick={(e) => e.stopPropagation()}>
          <Avatar>
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex flex-col flex-1 gap-1">
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Link 
              to={`/profile/${post.author.username}`} 
              className="font-bold text-white hover:underline" 
              onClick={(e) => e.stopPropagation()}
            >
              {post.author.name}
            </Link>
            <span>@{post.author.username}</span>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(post.createdAt))}</span>
          </div>

          <p className="text-base whitespace-pre-wrap">{post.content}</p>

          <div className="flex justify-between mt-3 max-w-md text-white/50">
            <button 
              className="group flex items-center gap-2 hover:text-sky-500 transition-colors" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 rounded-full group-hover:bg-sky-500/10 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-xs">{post.replies}</span>
            </button>

            <button 
              className="group flex items-center gap-2 hover:text-green-500 transition-colors" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Repeat2 className="w-4 h-4" />
              </div>
            </button>

            <button
              className={cn(
                'group flex items-center gap-2 hover:text-pink-500 transition-colors',
                post.likedByMe && 'text-pink-500'
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(post.id);
              }}
            >
              <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                <Heart className={cn('w-4 h-4', post.likedByMe && 'fill-current')} />
              </div>
              <span className="text-xs">{post.likes}</span>
            </button>

            <button 
              className="group flex items-center gap-2 hover:text-sky-500 transition-colors" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 rounded-full group-hover:bg-sky-500/10 transition-colors">
                <Share className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;
