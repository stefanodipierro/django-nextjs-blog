import React from 'react';
import { GetServerSideProps } from 'next';
import { getPosts } from '../../lib/api';
import PostGrid from '../../components/PostGrid';
import { Post } from '../../components/PostCard';

interface CategoryPageProps {
  initialPosts: Post[];
  initialHasMore: boolean;
  slug: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ initialPosts, initialHasMore, slug }) => {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{slug}</h1>
      <PostGrid initialPosts={initialPosts} initialHasMore={initialHasMore} />
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const { posts, hasMore } = await getPosts(1, 9, slug);
  return {
    props: {
      initialPosts: posts,
      initialHasMore: hasMore,
      slug,
    },
  };
};

export default CategoryPage; 