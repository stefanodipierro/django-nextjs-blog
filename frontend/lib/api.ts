import { Post } from '../components/PostCard';

// Determine execution environment (server/container vs browser)
const isServer = typeof window === 'undefined';

// Use different base URLs depending on where code is executing
const API_URL = isServer
  ? process.env.NEXT_PUBLIC_INTERNAL_API_URL || 'http://django:8000/api/v1'
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Theme data interface for hero section
 */
export interface ThemeData {
  id: number;
  theme_name: string;
  hero_image: string | null;
  hero_image_alt: string;
  hero_box_color: string;
}

/**
 * Fetches featured posts from the API
 */
export async function getFeaturedPosts(): Promise<Post[]> {
  try {
    const response = await fetch(`${API_URL}/featured-posts/`);
    
    if (!response.ok) {
      throw new Error(`Error fetching featured posts: ${response.status}`);
    }
    
    const data = await response.json();
    // Some endpoints might wrap results in { results: [] }
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

/**
 * Fetches the active theme with hero image data from the API
 */
export async function getActiveTheme(): Promise<ThemeData | null> {
  try {
    const response = await fetch(`${API_URL}/theme/`);
    if (!response.ok) {
      throw new Error(`Error fetching theme data: ${response.status}`);
    }
    
    // Parse and transform hero_image to full URL for remote loading
    const data = (await response.json()) as ThemeData;
    if (data.hero_image && !/^https?:\/\//i.test(data.hero_image)) {
      // Derive origin by removing '/api/v1' from API_URL
      const origin = isServer
        ? (process.env.NEXT_PUBLIC_INTERNAL_API_URL || 'http://django:8000').replace(/\/api\/v1\/?$/, '')
        : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '');
      data.hero_image = `${origin}${data.hero_image}`;
    }
    return data;
  } catch (error) {
    console.error('Error fetching theme data:', error);
    return null;
  }
}

/**
 * Fetches a paginated list of posts, optionally filtered by category or search term
 * @param page Page number to fetch
 * @param limit Number of posts per page
 * @param category Optional category slug to filter posts
 * @param search Optional search term to filter posts
 */
export async function getPosts(
  page = 1,
  limit = 9,
  category?: string,
  search?: string
): Promise<{
  posts: Post[],
  hasMore: boolean,
  totalPosts: number
}> {
  try {
    let url = `${API_URL}/posts/?page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching posts: ${response.status}`);
    }
    
    const data = await response.json();
    const results = Array.isArray(data) ? data : data.results || [];
    
    return {
      posts: results,
      hasMore: !!data.next,
      totalPosts: data.count || results.length,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      posts: [],
      hasMore: false,
      totalPosts: 0,
    };
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(`${API_URL}/posts/${slug}/`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error fetching post: ${response.status}`);
    }
    return (await response.json()) as Post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

/**
 * Subscribes a user to the newsletter via the API
 * @param email The email address to subscribe
 */
export async function subscribe(email: string): Promise<{ id: number; email: string; name?: string }> {
  try {
    const response = await fetch(
      `${API_URL}/subscribe/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }
    );
    if (!response.ok) {
      throw new Error(`Error subscribing: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in subscribe():', error);
    throw error;
  }
} 