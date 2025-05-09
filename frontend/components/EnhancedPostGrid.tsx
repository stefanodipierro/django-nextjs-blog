import React, { useRef } from 'react';
import PostCard, { Post } from './PostCard';
import PostSkeletonGrid from './PostSkeletonGrid';
import usePosts from '../hooks/usePosts';
import useIntersectionObserver from './useIntersectionObserver';

interface EnhancedPostGridProps {
  initialPosts: Post[];
  initialHasMore: boolean;
  observerThreshold?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  title?: string;
}

const EnhancedPostGrid: React.FC<EnhancedPostGridProps> = ({
  initialPosts,
  initialHasMore,
  observerThreshold = 0.1,
  pageSize = 9,
  category,
  search,
  title = 'Latest Posts'
}) => {
  // Use custom hook to manage posts state
  const {
    posts,
    isLoading,
    error,
    hasMore,
    reachedEnd,
    loadMorePosts
  } = usePosts({
    initialPosts,
    initialHasMore,
    pageSize,
    category,
    search
  });

  // Reference for the loading element
  const loadingRef = useRef<HTMLDivElement>(null);
  
  // Use custom hook for intersection observer
  const { observe } = useIntersectionObserver({
    threshold: observerThreshold,
    enabled: hasMore && !isLoading,
    onIntersect: loadMorePosts
  });
  
  // Connect the loading element with the observer
  React.useEffect(() => {
    if (loadingRef.current) {
      observe(loadingRef.current);
    }
  }, [observe]);
  
  // Error state - the user can retry loading
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
  
  // Empty state
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        <p>No posts found. Check back soon!</p>
      </div>
    );
  }
  
  // Normal state with posts
  return (
    <section data-testid="post-grid">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      {hasMore ? (
        <div 
          ref={loadingRef} 
          className="py-8 min-h-20"
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
            <p data-testid="end-message">You&apos;ve reached the end! No more posts to load.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default EnhancedPostGrid; 