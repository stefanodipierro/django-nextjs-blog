import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import FeaturedPosts from '../components/FeaturedPosts';
import PostGrid from '../components/PostGrid';
import { getFeaturedPosts, getPosts } from '../lib/api';
import { Post } from '../components/PostCard';

interface HomeProps {
  initialFeaturedPosts: Post[];
  initialPosts: Post[];
  initialHasMore: boolean;
}

export async function getServerSideProps() {
  try {
    // Fetch featured posts
    const featuredPosts = await getFeaturedPosts();
    
    // Fetch regular posts (page 1)
    const { posts, hasMore } = await getPosts(1);
    
    return {
      props: {
        initialFeaturedPosts: featuredPosts || [],
        initialPosts: posts || [],
        initialHasMore: hasMore || false,
      }
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return {
      props: {
        initialFeaturedPosts: [],
        initialPosts: [],
        initialHasMore: false,
      }
    };
  }
}

const Home: React.FC<HomeProps> = ({ 
  initialFeaturedPosts, 
  initialPosts, 
  initialHasMore 
}) => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>(initialFeaturedPosts);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [featuredError, setFeaturedError] = useState<Error | null>(null);
  
  // Refetch featured posts on client-side for fresh data
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      if (initialFeaturedPosts.length > 0) return; // Skip if we already have data from SSR
      
      setIsLoadingFeatured(true);
      
      try {
        const data = await getFeaturedPosts();
        setFeaturedPosts(data);
        setFeaturedError(null);
      } catch (error) {
        setFeaturedError(error instanceof Error ? error : new Error('Failed to load featured posts'));
      } finally {
        setIsLoadingFeatured(false);
      }
    };
    
    fetchFeaturedPosts();
  }, [initialFeaturedPosts.length]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>Blog Template</title>
        <meta name="description" content="A modern blog template built with Next.js and Django" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Blog Template
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A modern, minimalist blog built with Django, Next.js, and Tailwind CSS.
          </p>
        </header>
        
        {/* Search form on homepage */}
        <form method="get" action="/search" className="mb-8 flex justify-center">
          <input
            type="text"
            name="q"
            placeholder="Search posts..."
            className="w-1/2 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
          >
            Search
          </button>
        </form>
        
        <FeaturedPosts 
          posts={featuredPosts} 
          isLoading={isLoadingFeatured} 
          error={featuredError} 
        />
        
        <PostGrid 
          initialPosts={initialPosts} 
          initialHasMore={initialHasMore} 
        />
      </main>
    </div>
  );
};

export default Home; 