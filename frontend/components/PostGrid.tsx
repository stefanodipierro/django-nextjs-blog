import React, { useState, useRef, useEffect, useCallback } from 'react';
import PostCard, { Post } from './PostCard';
import { getPosts } from '../lib/api';

interface PostGridProps {
  initialPosts: Post[];
  initialHasMore: boolean;
}

const PostGrid: React.FC<PostGridProps> = ({ initialPosts, initialHasMore }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const nextPage = page + 1;
      const result = await getPosts(nextPage);
      
      setPage(nextPage);
      setPosts(prevPosts => [...prevPosts, ...result.posts]);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load posts'));
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, page]);
  
  useEffect(() => {
    if (!loadingRef.current) return;
    
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );
    
    observerRef.current.observe(loadingRef.current);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMorePosts]);
  
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
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Latest Posts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      {hasMore && (
        <div 
          ref={loadingRef} 
          className="text-center py-8"
        >
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading more posts...</span>
            </div>
          ) : (
            <div className="h-8 w-full"></div>
          )}
        </div>
      )}
    </section>
  );
};

export default PostGrid; 