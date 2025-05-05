import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getPosts } from '../lib/api';
import PostGrid from '../components/PostGrid';
import { Post } from '../components/PostCard';
import Head from 'next/head';

interface SearchPageProps {
  initialPosts: Post[];
  initialHasMore: boolean;
  q: string;
}

const SearchPage: React.FC<SearchPageProps> = ({ initialPosts, initialHasMore, q }) => {
  const [query, setQuery] = useState(q);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>Search: {q} | Blog Template</title>
        <meta name="description" content={`Search results for '${q}' on Blog Template`} />
      </Head>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white truncate">
          Search: <span className="text-indigo-600 dark:text-indigo-400">"{q}"</span>
        </h1>
        
        <form method="get" action="/search" className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              name="q"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full sm:flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              aria-label="Search query"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>
        
        <PostGrid 
          initialPosts={initialPosts} 
          initialHasMore={initialHasMore} 
          observerThreshold={0.2}
          pageSize={9}
          search={q}
        />
      </main>
    </div>
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