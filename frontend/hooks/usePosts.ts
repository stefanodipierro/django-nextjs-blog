import { useState, useCallback, useRef, useEffect } from 'react';
import { Post } from '../components/PostCard';
import { getPosts } from '../lib/api';

interface UsePostsOptions {
  initialPosts?: Post[];
  initialHasMore?: boolean;
  initialPage?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}

interface UsePostsReturn {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  reachedEnd: boolean;
  loadMorePosts: () => Promise<void>;
  resetPosts: () => void;
}

/**
 * Custom hook for fetching and managing blog posts with infinite scroll functionality
 */
export default function usePosts({
  initialPosts = [],
  initialHasMore = false,
  initialPage = 1,
  pageSize = 9,
  category,
  search
}: UsePostsOptions = {}): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reachedEnd, setReachedEnd] = useState(!initialHasMore);

  // Use a ref to prevent race conditions
  const isLoadingRef = useRef(isLoading);
  
  // Keep the ref in sync with state
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);
  
  // Reset posts when search or category changes
  useEffect(() => {
    if (search !== undefined || category !== undefined) {
      setPosts(initialPosts);
      setPage(initialPage);
      setHasMore(initialHasMore);
      setReachedEnd(!initialHasMore);
      setError(null);
    }
  }, [search, category, initialPosts, initialPage, initialHasMore]);
  
  // Function to load more posts
  const loadMorePosts = useCallback(async () => {
    // Guard against multiple simultaneous calls
    if (!hasMore || isLoadingRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const nextPage = page + 1;
      const result = await getPosts(nextPage, pageSize, category, search);
      
      // Check if we received any new posts
      if (!result.posts || result.posts.length === 0) {
        setHasMore(false);
        setReachedEnd(true);
        return;
      }
      
      setPage(nextPage);
      setPosts(prevPosts => [...prevPosts, ...result.posts]);
      setHasMore(result.hasMore);
      
      // If this was the last page, mark that we've reached the end
      if (!result.hasMore) {
        setReachedEnd(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load posts'));
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, page, pageSize, category, search]);
  
  // Function to reset posts (useful for filtering)
  const resetPosts = useCallback(() => {
    setPosts(initialPosts);
    setPage(initialPage);
    setHasMore(initialHasMore);
    setReachedEnd(!initialHasMore);
    setError(null);
  }, [initialPosts, initialPage, initialHasMore]);
  
  return {
    posts,
    isLoading,
    error,
    hasMore,
    reachedEnd,
    loadMorePosts,
    resetPosts
  };
} 