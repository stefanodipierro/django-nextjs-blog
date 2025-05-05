import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getPosts } from '../lib/api';
import PostGrid from '../components/PostGrid';
import { Post } from '../components/PostCard';

interface SearchPageProps {
  initialPosts: Post[];
  initialHasMore: boolean;
  q: string;
}

const SearchPage: React.FC<SearchPageProps> = ({ initialPosts, initialHasMore, q }) => {
  const [query, setQuery] = useState(q);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search: "{q}"</h1>
      <form method="get" action="/search" className="mb-6 flex gap-2">
        <input
          type="text"
          name="q"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Search
        </button>
      </form>
      <PostGrid 
        initialPosts={initialPosts} 
        initialHasMore={initialHasMore} 
        observerThreshold={0.2}
        pageSize={9}
        search={q}
      />
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const q = (query.q as string) || '';
  const { posts, hasMore } = await getPosts(1, 9, undefined, q);
  return {
    props: {
      initialPosts: posts,
      initialHasMore: hasMore,
      q,
    },
  };
};

export default SearchPage; 