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
  blur_data_url?: string | null;
}

interface PostCardProps {
  post: Post;
}

// Generic blur placeholder SVG (10x10 grey) as fallback
const FALLBACK_BLUR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PC9zdmc+';

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Use the dynamic blur data URL if available, otherwise fall back to the static one
  const blurDataURL = post.blur_data_url || FALLBACK_BLUR_PLACEHOLDER;

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all
      hover:shadow-lg flex flex-col h-full
      ${post.is_featured ? 'border-l-4 border-indigo-500' : ''}
    `}>
      {post.featured_image && (
        <div className="relative h-40 sm:h-48 md:h-52 w-full">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      )}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
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
        
        <Link href={`/posts/${post.slug}`} className="group mb-auto">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 md:mb-4 line-clamp-3">
          {post.excerpt || post.title}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-auto">
          <span className="text-xs sm:text-xs truncate max-w-[60%]">{formattedDate}</span>
          <span className="text-xs sm:text-xs">{post.reading_time} min read</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard; 