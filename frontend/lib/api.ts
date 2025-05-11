import { Post } from '../components/PostCard';

// Determine execution environment (server/container vs browser)
const isServer = typeof window === 'undefined';
console.log(`[API] isServer: ${isServer}`);

// Use different base URLs depending on where code is executing
const API_URL = isServer
  ? process.env.NEXT_PUBLIC_INTERNAL_API_URL || 'http://django:8000/api/v1'
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
console.log(`[API] Using API_URL: ${API_URL}`);

// Derive the base URL for media assets (remove '/api/v1' from API_URL)
const MEDIA_BASE_URL = isServer
  ? (process.env.NEXT_PUBLIC_INTERNAL_API_URL || 'http://django:8000').replace(/\/api\/v1\/?$/, '')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '');
console.log(`[API] Using MEDIA_BASE_URL: ${MEDIA_BASE_URL}`);

/**
 * Helper function to transform relative image URLs to absolute URLs
 * using the correct host (django:8000 or localhost:8000)
 */
function transformImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url; // already absolute
  
  // Ensure URL has a leading slash
  const urlPath = url.startsWith('/') ? url : `/${url}`;
  return `${MEDIA_BASE_URL}${urlPath}`;
}

/**
 * Transform all image URLs in a post from relative to absolute
 */
function transformPostImageUrls(post: Post): Post {
  if (post.featured_image) {
    const originalUrl = post.featured_image;
    post.featured_image = transformImageUrl(post.featured_image);
    console.log(`[API:transform] Post ${post.id} featured_image: ${originalUrl} -> ${post.featured_image}`);
  }
  
  if (post.side_image_1) {
    const originalUrl = post.side_image_1;
    post.side_image_1 = transformImageUrl(post.side_image_1);
    console.log(`[API:transform] Post ${post.id} side_image_1: ${originalUrl} -> ${post.side_image_1}`);
  }
  
  if (post.side_image_2) {
    const originalUrl = post.side_image_2;
    post.side_image_2 = transformImageUrl(post.side_image_2);
    console.log(`[API:transform] Post ${post.id} side_image_2: ${originalUrl} -> ${post.side_image_2}`);
  }
  
  return post;
}

/**
 * Theme data interface for hero section
 */
export interface ThemeData {
  id: number;
  theme_name: string;
  hero_image: string | null;
  hero_image_alt: string;
  hero_box_color: string;
  show_navbar: boolean;
}

/**
 * Fetches featured posts from the API
 * @param category Optional category slug to filter featured posts
 */
export async function getFeaturedPosts(category?: string | null): Promise<Post[]> {
  try {
    // Build the URL with optional category filter
    let url = `${API_URL}/featured-posts/`;
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }
    
    console.log(`[API:getFeaturedPosts] Fetching from ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching featured posts: ${response.status}`);
    }
    
    const data = await response.json();
    // Some endpoints might wrap results in { results: [] }
    const results = Array.isArray(data) ? data : data.results || [];
    
    console.log(`[API:getFeaturedPosts] Got ${results.length} posts${category ? ` for category ${category}` : ''}`);
    
    // Transform image URLs in all posts
    const transformedResults = results.map((post: Post) => transformPostImageUrls(post));
    
    if (transformedResults.length > 0) {
      console.log(`[API:getFeaturedPosts] Sample transformed image URLs:`, {
        post_id: transformedResults[0].id,
        featured_image: transformedResults[0].featured_image
      });
    }
    
    return transformedResults;
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
    console.log(`[API:getActiveTheme] Fetching from ${API_URL}/theme/`);
    const response = await fetch(`${API_URL}/theme/`);
    if (!response.ok) {
      throw new Error(`Error fetching theme data: ${response.status}`);
    }
    
    // Parse and transform hero_image to full URL for remote loading
    const data = (await response.json()) as ThemeData;
    console.log(`[API:getActiveTheme] Original hero_image: ${data.hero_image}`);
    
    if (data.hero_image) {
      data.hero_image = transformImageUrl(data.hero_image);
      console.log(`[API:getActiveTheme] Transformed hero_image: ${data.hero_image}`);
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
  category?: string | null,
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
    console.log(`[API:getPosts] Fetching from ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching posts: ${response.status}`);
    }
    
    const data = await response.json();
    const results = Array.isArray(data) ? data : data.results || [];
    
    console.log(`[API:getPosts] Got ${results.length} posts, hasMore: ${!!data.next}, total: ${data.count || results.length}`);
    
    // Transform image URLs in all posts
    const transformedResults = results.map((post: Post) => transformPostImageUrls(post));
    
    if (transformedResults.length > 0) {
      console.log(`[API:getPosts] Sample transformed image URLs:`, {
        post_id: transformedResults[0].id,
        featured_image: transformedResults[0].featured_image
      });
    }
    
    return {
      posts: transformedResults,
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
    console.log(`[API:getPost] Fetching post ${slug} from ${API_URL}/posts/${slug}/`);
    const response = await fetch(`${API_URL}/posts/${slug}/`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error fetching post: ${response.status}`);
    }
    const post = await response.json() as Post;
    console.log(`[API:getPost] Got post ${post.id} - ${post.title}`);
    console.log(`[API:getPost] Original image URLs:`, {
      featured_image: post.featured_image,
      side_image_1: post.side_image_1,
      side_image_2: post.side_image_2
    });
    
    // Transform image URLs
    const transformedPost = transformPostImageUrls(post);
    
    console.log(`[API:getPost] Transformed image URLs:`, {
      featured_image: transformedPost.featured_image,
      side_image_1: transformedPost.side_image_1,
      side_image_2: transformedPost.side_image_2
    });
    
    return transformedPost;
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

/**
 * Category data interface
 */
export interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

/**
 * Fetches list of categories from the API
 */
export async function getCategories(): Promise<CategoryData[]> {
  try {
    const response = await fetch(`${API_URL}/categories/`);
    if (!response.ok) {
      throw new Error(`Error fetching categories: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
} 