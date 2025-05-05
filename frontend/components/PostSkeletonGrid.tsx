import React from 'react';
import PostCardSkeleton from './PostCardSkeleton';

interface PostSkeletonGridProps {
  count?: number;
}

const PostSkeletonGrid: React.FC<PostSkeletonGridProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default PostSkeletonGrid; 