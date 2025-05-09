import React, { useState, useRef, useEffect, useCallback } from 'react';
import PostCard, { Post } from './PostCard';
import PostSkeletonGrid from './PostSkeletonGrid';
import { getPosts } from '../lib/api';

interface PostGridProps {
  initialPosts: Post[];
  initialHasMore: boolean;
  observerThreshold?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}

const PostGrid: React.FC<PostGridProps> = ({ 
  initialPosts, 
  initialHasMore, 
  observerThreshold = 0.1,
  pageSize = 9,
  category,
  search
}) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reachedEnd, setReachedEnd] = useState(!initialHasMore);
  
  const loadingRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(isLoading);
  
  // Keep isLoadingRef in sync with isLoading state
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);
  
  const loadMorePosts = useCallback(async () => {
    // Use ref to prevent race conditions between state updates and function calls
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

  // Inline IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: observerThreshold }
    );
    const node = loadingRef.current;
    if (node) {
      observer.observe(node);
    }
    return () => {
      if (node) observer.unobserve(node);
      observer.disconnect();
    };
  }, [hasMore, isLoading, loadMorePosts, observerThreshold]);
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg text-red-800 dark:text-red-200 mb-8">
        <p>Error loading posts: {error.message}</p>
        <button 
          onClick={() => loadMorePosts()}
          className="mt-4 bg-red-100 dark:bg-red-800 px-4 py-2 rounded-md text-red-800 dark:text-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        <p>No posts found. Check back soon!</p>
      </div>
    );
  }
  
  return (
    <section data-testid="post-grid">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Latest Posts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      {hasMore ? (
        <div 
          ref={loadingRef} 
          className="py-8"
          data-testid="loading-trigger"
        >
          {isLoading ? (
            <div>
              <div className="mb-4 text-center text-gray-600 dark:text-gray-400">
                <span>Loading more posts...</span>
              </div>
              <PostSkeletonGrid count={3} />
            </div>
          ) : (
            <div className="h-8 w-full"></div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          {reachedEnd && posts.length > 0 && (
            <p data-testid="end-message">You've reached the end! No more posts to load.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default PostGrid; 