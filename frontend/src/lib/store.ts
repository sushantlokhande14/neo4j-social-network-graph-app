import { create } from 'zustand';

/**
 * User type for posts and profile display.
 */
export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  joinedDate?: string;
}

/**
 * Post type for the feed.
 */
export interface Post {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
  replies: number;
  likedByMe: boolean;
}

/**
 * Current user profile for sharing across components.
 */
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
}

interface AppState {
  posts: Post[];
  isLoadingFeed: boolean;
  feedError: string | null;
  currentProfile: UserProfile | null;
  addPost: (content: string, author: User) => void;
  toggleLike: (postId: string) => void;
  setFeedPosts: (posts: Post[]) => void;
  setFeedLoading: (isLoading: boolean) => void;
  setFeedError: (error: string | null) => void;
  setCurrentProfile: (profile: UserProfile | null) => void;
}

/**
 * Zustand store for app state management.
 * Requirements: 2.4, 3.1, 3.2, 5.2, 5.3
 */
export const useAppStore = create<AppState>((set) => ({
  posts: [],
  isLoadingFeed: false,
  feedError: null,
  currentProfile: null,

  /**
   * Adds a new post to the feed.
   * Requirements: 5.2
   */
  addPost: (content: string, author: User) =>
    set((state) => ({
      posts: [
        {
          id: Math.random().toString(36).substring(7),
          content,
          author,
          createdAt: new Date().toISOString(),
          likes: 0,
          replies: 0,
          likedByMe: false,
        },
        ...state.posts,
      ],
    })),

  /**
   * Toggles the like state of a post.
   * Requirements: 5.3
   */
  toggleLike: (postId: string) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
              likedByMe: !post.likedByMe,
            }
          : post
      ),
    })),

  /**
   * Sets the feed posts from API response.
   * Requirements: 2.4
   */
  setFeedPosts: (posts: Post[]) => set({ posts }),

  /**
   * Sets the feed loading state.
   * Requirements: 2.4
   */
  setFeedLoading: (isLoading: boolean) => set({ isLoadingFeed: isLoading }),

  /**
   * Sets the feed error state.
   * Requirements: 2.4
   */
  setFeedError: (error: string | null) => set({ feedError: error }),

  /**
   * Sets the current user profile.
   * Used to sync profile data across components (ProfilePage, FloatingDock).
   */
  setCurrentProfile: (profile: UserProfile | null) => set({ currentProfile: profile }),
}));
