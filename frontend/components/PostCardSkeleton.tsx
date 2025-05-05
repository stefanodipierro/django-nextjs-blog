import React from 'react';

const PostCardSkeleton: React.FC = () => {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {/* Image placeholder */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 animate-pulse">
        <div className="absolute inset-0"></div>
      </div>

      {/* Content area */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Category placeholder */}
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>

        {/* Title placeholder */}
        <div className="h-7 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-2 animate-pulse"></div>
        <div className="h-7 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 animate-pulse"></div>

        {/* Excerpt placeholder */}
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-2 animate-pulse"></div>
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-2 animate-pulse"></div>
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 animate-pulse"></div>

        {/* Metadata placeholder (date, reading time) */}
        <div className="mt-auto flex justify-between">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>
      </div>
    </article>
  );
};

export default PostCardSkeleton; 