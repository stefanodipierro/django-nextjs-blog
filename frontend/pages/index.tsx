import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import FeaturedPosts from '../components/FeaturedPosts';
import PostGrid from '../components/PostGrid';
import HeroSection from '../components/HeroSection';
import CategoryNavBar from '../components/CategoryNavBar';
import { getFeaturedPosts, getPosts, getActiveTheme, ThemeData } from '../lib/api';
import { Post } from '../components/PostCard';
import { getPublicImageUrl, getCanonicalUrl } from '../lib/utils';

interface HomeProps {
  initialFeaturedPosts: Post[];
  initialPosts: Post[];
  initialHasMore: boolean;
  initialTheme: ThemeData | null;
}

// Site URL from environment variable with fallback
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
  // Add state for selected category
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Add postGridKey to force remount of PostGrid when category changes
  const [postGridKey, setPostGridKey] = useState(0);
  
  // Blog title and subtitle - can be moved to configuration or CMS later
  const blogTitle = "Blog Template";
  const blogSubtitle = "A modern, minimalist blog built with Django, Next.js, and Tailwind CSS.";
  
  // Get hero image URL for meta tags if available
  const heroImageUrl = theme?.hero_image ? getPublicImageUrl(theme.hero_image) : null;
  
  // Canonical URL for homepage
  const canonicalUrl = getCanonicalUrl('/');
  
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
  
  // Handle category selection
  const handleCategorySelect = async (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    
    // Update featured posts to only show those from the selected category
    if (categorySlug) {
      setIsLoadingFeatured(true);
      try {
        // Fetch featured posts with the selected category
        const filteredFeaturedPosts = await getFeaturedPosts(categorySlug);
        setFeaturedPosts(filteredFeaturedPosts);
        setFeaturedError(null);
      } catch (error) {
        setFeaturedError(error instanceof Error ? error : new Error('Failed to load filtered featured posts'));
        // Fallback to initial featured posts if filtering fails
        setFeaturedPosts(initialFeaturedPosts);
      } finally {
        setIsLoadingFeatured(false);
      }
    } else {
      // If no category is selected, revert to all featured posts
      setFeaturedPosts(initialFeaturedPosts);
    }
    
    // Increment key to force PostGrid remount with new category
    setPostGridKey(prev => prev + 1);
  };
  
  // Create JSON-LD schema data for the website
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": blogTitle,
    "description": blogSubtitle,
    "url": canonicalUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/search?q={search_term}`
      },
      "query-input": "required name=search_term"
    }
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>{blogTitle}</title>
        <meta name="description" content={blogSubtitle} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Preload hero image for faster LCP */}
        {heroImageUrl && (
          <link 
            rel="preload" 
            href={heroImageUrl} 
            as="image" 
            // Use standard attributes only
            fetchPriority="high" 
          />
        )}
        
        {/* OpenGraph meta tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={blogTitle} />
        <meta property="og:description" content={blogSubtitle} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={blogTitle} />
        
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blogTitle} />
        <meta name="twitter:description" content={blogSubtitle} />
        
        {/* OpenGraph hero image if available */}
        {heroImageUrl && (
          <>
            <meta property="og:image" content={heroImageUrl} />
            <meta property="og:image:alt" content={theme?.hero_image_alt || blogTitle} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:image" content={heroImageUrl} />
          </>
        )}
        
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
        
        {/* Category Navbar - conditionally render based on theme setting */}
        {theme?.show_navbar && (
          <CategoryNavBar 
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        )}
        
        <FeaturedPosts 
          posts={featuredPosts} 
          isLoading={isLoadingFeatured} 
          error={featuredError} 
        />
        
        <PostGrid 
          key={postGridKey}
          initialPosts={initialPosts} 
          initialHasMore={initialHasMore}
          observerThreshold={0.2}
          pageSize={9}
          category={selectedCategory}
        />
      </main>
    </div>
  );
};

export default Home; 