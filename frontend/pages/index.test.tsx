import React from 'react';
import Head from 'next/head';
import FeaturedPosts from '../components/FeaturedPosts';
import PostGrid from '../components/PostGrid';
import { Post } from '../components/PostCard';

// Mock data for testing
const mockFeaturedPosts: Post[] = [
  {
    id: 1,
    title: 'Top 10 Tech Trends in 2025',
    slug: 'top-10-tech-trends-2025',
    excerpt: 'Discover the top tech trends that will shape our future.',
    featured_image: 'https://picsum.photos/800/600?random=1',
    published_at: new Date().toISOString(),
    reading_time: 5,
    categories: [
      { id: 1, name: 'Technology', slug: 'technology' }
    ],
    tags: ['tech', 'trends', '2025'],
    is_featured: true
  },
  {
    id: 2,
    title: 'Amazing Places to Visit in 2025',
    slug: 'amazing-places-2025',
    excerpt: 'Discover the most breathtaking travel destinations for your next vacation.',
    featured_image: 'https://picsum.photos/800/600?random=3',
    published_at: new Date().toISOString(),
    reading_time: 6,
    categories: [
      { id: 2, name: 'Travel', slug: 'travel' }
    ],
    tags: ['travel', 'vacation', '2025'],
    is_featured: true
  }
];

const mockRegularPosts: Post[] = [
  {
    id: 3,
    title: 'Building Modern Web Applications',
    slug: 'building-modern-web-apps',
    excerpt: 'Learn how to build full-stack applications with Django and React.',
    featured_image: 'https://picsum.photos/800/600?random=2',
    published_at: new Date().toISOString(),
    reading_time: 7,
    categories: [
      { id: 1, name: 'Technology', slug: 'technology' }
    ],
    tags: ['web', 'development', 'django', 'react'],
    is_featured: false
  },
  {
    id: 4,
    title: 'Delicious Summer Recipes',
    slug: 'summer-recipes',
    excerpt: 'Try these refreshing summer recipes that are perfect for hot days.',
    featured_image: 'https://picsum.photos/800/600?random=4',
    published_at: new Date().toISOString(),
    reading_time: 4,
    categories: [
      { id: 3, name: 'Food', slug: 'food' }
    ],
    tags: ['food', 'recipes', 'summer'],
    is_featured: false
  },
  {
    id: 5,
    title: 'Effective Remote Work Strategies',
    slug: 'remote-work-strategies',
    excerpt: 'Learn how to stay productive while working from home.',
    featured_image: 'https://picsum.photos/800/600?random=5',
    published_at: new Date().toISOString(),
    reading_time: 5,
    categories: [
      { id: 4, name: 'Work', slug: 'work' }
    ],
    tags: ['work', 'remote', 'productivity'],
    is_featured: false
  }
];

const TestHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>Blog Template (Test)</title>
        <meta name="description" content="A modern blog template built with Next.js and Django" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Blog Template (Test Version)
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            This is a test page using static mock data. No API connection is required.
          </p>
        </header>
        
        <FeaturedPosts 
          posts={mockFeaturedPosts} 
          isLoading={false} 
          error={null} 
        />
        
        <PostGrid 
          initialPosts={mockRegularPosts} 
          initialHasMore={false} 
        />
      </main>
    </div>
  );
};

export default TestHomePage; 