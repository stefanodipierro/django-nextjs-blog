import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from './PostCard';

interface FeaturedPostsProps {
  posts: Post[];
  isLoading: boolean;
  error: any;
}

const FeaturedPosts: React.FC<FeaturedPostsProps> = ({ posts, isLoading, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg text-red-800 dark:text-red-200 mb-8">
        <p>Error loading featured posts. Please try again later.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Featured Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Featured Posts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div 
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border-l-4 border-indigo-500 transition-transform hover:scale-[1.02]"
          >
            {post.featured_image && (
              <div className="relative h-48 w-full">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            
            <div className="p-5">
              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.categories.slice(0, 2).map(category => (
                    <Link 
                      href={`/category/${category.slug}`} 
                      key={category.id}
                      className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
              
              <Link href={`/posts/${post.slug}`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {post.title}
                </h3>
              </Link>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}</span>
                <span>{post.reading_time} min read</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedPosts; 