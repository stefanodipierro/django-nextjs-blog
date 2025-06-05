import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from './PostCard';
import PostCardSkeleton from './PostCardSkeleton';
import { getOptimizedImageUrl } from '../lib/utils';
import { devLog } from '../lib/logger';

interface FeaturedPostsProps {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
}

// Generic blur placeholder SVG (10x10 grey) as fallback
const FALLBACK_BLUR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PC9zdmc+';

const FeaturedPosts: React.FC<FeaturedPostsProps> = ({ posts, isLoading, error }) => {
  // Add state for client-side date formatting
  const [mountedPosts, setMountedPosts] = useState<Record<number, boolean>>({});
  const [formattedDates, setFormattedDates] = useState<Record<number, string>>({});

  useEffect(() => {
    // Format dates for all posts on the client side
    const newDates: Record<number, string> = {};
    const newMounted: Record<number, boolean> = {};
    
    posts.forEach(post => {
      const date = new Date(post.published_at);
      newDates[post.id] = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      newMounted[post.id] = true;
    });
    
    setFormattedDates(newDates);
    setMountedPosts(newMounted);
  }, [posts]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg text-red-800 dark:text-red-200 mb-8">
        <p>Error loading featured posts: {error.message}</p>
      </div>
    );
  }

  if (isLoading && (!posts || posts.length === 0)) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Featured Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </section>
    );
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  devLog(`[FeaturedPosts] Rendering ${posts.length} featured posts`);

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Featured Posts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          devLog(`[FeaturedPosts] Processing post ${post.id}, with image ${post.featured_image}`);
          
          // Get optimized image URL
          const optimizedImageUrl = getOptimizedImageUrl(post.featured_image);
          devLog(`[FeaturedPosts] Optimized URL for post ${post.id}: ${optimizedImageUrl}`);
          
          return (
            <Link 
              key={post.id}
              href={`/posts/${post.slug}`}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg border-l-4 border-indigo-500 transition-all hover:scale-[1.02] flex flex-col"
              aria-label={`Read more about ${post.title}`}
            >
              {optimizedImageUrl && (
                <div className="relative h-48 w-full">
                  <Image
                    src={optimizedImageUrl}
                    alt={post.title}
                    fill
                    placeholder="blur"
                    blurDataURL={post.blur_data_url || FALLBACK_BLUR_PLACEHOLDER}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
                  />
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                {post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.categories.slice(0, 2).map(category => (
                      <span 
                        key={category.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/category/${category.slug}`;
                        }}
                        className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
                  {post.excerpt}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-auto">
                  <span>
                    {mountedPosts[post.id] ? formattedDates[post.id] : ''}
                  </span>
                  <span>{post.reading_time} min read</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedPosts; 