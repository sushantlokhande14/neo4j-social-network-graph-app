import { useState, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';
import { useApiClient } from '@/hooks/use-api';
import { useAppStore } from '@/lib/store';
import type { User } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ProfileResponse } from '@/lib/api';

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
  '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒',
  '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴',
  '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶',
  '👍', '👎', '👏', '🙌', '🤝', '❤️', '🔥', '✨',
  '🎉', '🎊', '💯', '⭐', '🌟', '💪', '🤞', '✌️',
];

/**
 * ComposePost component for creating new posts.
 * Requirements: 5.1, 5.2
 */
export function ComposePost() {
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const api = useApiClient();
  const { addPost } = useAppStore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch user profile from backend
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const profile = await api.get<ProfileResponse>(`/api/profile/${user.id}`);
        setCurrentUser({
          id: profile.id,
          name: profile.name,
          username: profile.username,
          avatar: `/avatars/${profile.avatar}.svg`,
          bio: profile.bio,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to auth user data
        setCurrentUser({
          id: user.id,
          name: user.displayName || 'User',
          username: user.email?.split('@')[0] || 'user',
          avatar: '/avatars/avatar_1.svg',
        });
      }
    }

    fetchProfile();
  }, [user, api]);

  if (!currentUser) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;
    addPost(content, currentUser);
    setContent('');
  };

  return (
    <div className="border-b border-white/10 p-4 flex gap-4">
      <Avatar>
        <AvatarImage src={currentUser.avatar} />
        <AvatarFallback>{currentUser.name?.[0] || '?'}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col flex-1 gap-4">
        <Textarea
          placeholder="What is happening?!"
          className="bg-transparent border-none resize-none text-xl placeholder:text-white/50 focus-visible:ring-0 p-0 min-h-[50px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-1 text-sky-500">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-sky-500/10 hover:text-sky-500">
                  <Smile className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="p-1 text-xl hover:bg-white/10 rounded cursor-pointer"
                      onClick={() => setContent((prev) => prev + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="rounded-full font-bold bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ComposePost;
