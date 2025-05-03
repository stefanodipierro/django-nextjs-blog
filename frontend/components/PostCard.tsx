import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featured_image: string | null;
  published_at: string;
  reading_time: number;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  tags: string[];
  is_featured: boolean;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all
      hover:shadow-lg ${post.is_featured ? 'border-l-4 border-indigo-500' : ''}
    `}>
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
        <div className="flex flex-wrap gap-2 mb-3">
          {post.categories.map(category => (
            <Link 
              href={`/category/${category.slug}`} 
              key={category.id}
              className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
        
        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {post.excerpt || post.title}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>{formattedDate}</span>
          <span>{post.reading_time} min read</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard; 