import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import FeaturedPosts from '../components/FeaturedPosts';
import PostGrid from '../components/PostGrid';
import HeroSection from '../components/HeroSection';
import { getFeaturedPosts, getPosts, getActiveTheme, ThemeData } from '../lib/api';
import { Post } from '../components/PostCard';

interface HomeProps {
  initialFeaturedPosts: Post[];
  initialPosts: Post[];
  initialHasMore: boolean;
  initialTheme: ThemeData | null;
}

export async function getServerSideProps() {
  try {
    // Fetch theme data for hero section
    const theme = await getActiveTheme();
    
    // Fetch featured posts
    const featuredPosts = await getFeaturedPosts();
    
    // Fetch regular posts (page 1)
    const { posts, hasMore } = await getPosts(1);
    
    return {
      props: {
        initialTheme: theme,
        initialFeaturedPosts: featuredPosts || [],
        initialPosts: posts || [],
        initialHasMore: hasMore || false,
      }
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return {
      props: {
        initialTheme: null,
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
  initialHasMore,
  initialTheme
}) => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>(initialFeaturedPosts);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [featuredError, setFeaturedError] = useState<Error | null>(null);
  const [theme, setTheme] = useState<ThemeData | null>(initialTheme);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  
  // Blog title and subtitle - can be moved to configuration or CMS later
  const blogTitle = "Blog Template";
  const blogSubtitle = "A modern, minimalist blog built with Django, Next.js, and Tailwind CSS.";
  
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
    
    // Refetch theme data if not available from SSR
    const fetchThemeData = async () => {
      if (initialTheme) return; // Skip if we already have data from SSR
      
      setIsLoadingTheme(true);
      
      try {
        const data = await getActiveTheme();
        setTheme(data);
      } catch (error) {
        console.error('Failed to load theme data:', error);
      } finally {
        setIsLoadingTheme(false);
      }
    };
    
    fetchFeaturedPosts();
    fetchThemeData();
  }, [initialFeaturedPosts.length, initialTheme]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>Blog Template</title>
        <meta name="description" content="A modern blog template built with Next.js and Django" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* OpenGraph meta tags for hero image */}
        {theme?.hero_image && (
          <>
            <meta property="og:image" content={theme.hero_image} />
            <meta property="og:image:alt" content={theme.hero_image_alt || blogTitle} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        )}
      </Head>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        {/* Hero Section */}
        <HeroSection 
          theme={theme} 
          title={blogTitle} 
          subtitle={blogSubtitle} 
          isLoading={isLoadingTheme} 
        />
        
        {/* Search form on homepage */}
        <form method="get" action="/search" className="mb-6 sm:mb-8 flex justify-center">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl flex">
            <input
              type="text"
              name="q"
              placeholder="Search posts..."
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>
        
        <FeaturedPosts 
          posts={featuredPosts} 
          isLoading={isLoadingFeatured} 
          error={featuredError} 
        />
        
        <PostGrid 
          initialPosts={initialPosts} 
          initialHasMore={initialHasMore}
          observerThreshold={0.2}
          pageSize={9} 
        />
      </main>
    </div>
  );
};

export default Home; 