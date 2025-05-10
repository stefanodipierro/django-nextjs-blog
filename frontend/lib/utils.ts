/**
 * Utility functions for the frontend
 */

/**
 * Ensures image URLs are properly formatted for Next.js Image optimization
 * 
 * This function transforms relative URLs like '/media/posts/image.jpg' into
 * absolute URLs that Next.js Image optimization can access:
 * - For client-side: Uses 'http://localhost:8000/media/...'
 * - For server-side: Uses 'http://django:8000/media/...'
 * 
 * It also handles special cases like URLs from external services
 * and URLs that might be incorrectly encapsulated.
 * 
 * @param url The image URL to transform
 * @returns Properly formatted image URL
 */
export function getOptimizedImageUrl(url: string | null): string {
  console.log(`[getOptimizedImageUrl] Input URL: ${url}`);
  
  if (!url) {
    console.log('[getOptimizedImageUrl] Empty URL, returning empty string');
    return '';
  }
  
  // Check if we're running on the server or client
  const isServer = typeof window === 'undefined';
  console.log(`[getOptimizedImageUrl] Is Server: ${isServer}`);
  
  let finalUrl = url;
  
  // Check for encoded external URLs (like http://django:8000/media/https%3A/picsum.photos/...)
  const encodedExternalUrlMatch = url.match(/https?:\/\/[^\/]+\/media\/(https?(%3A|:).+)/i);
  if (encodedExternalUrlMatch) {
    const encodedPart = encodedExternalUrlMatch[1];
    // Try to extract and decode the actual external URL
    const decodedUrl = decodeURIComponent(encodedPart.replace(/%3A/g, ':'));
    if (decodedUrl.startsWith('http')) {
      console.log(`[getOptimizedImageUrl] Detected encapsulated external URL: ${decodedUrl}`);
      finalUrl = decodedUrl;
    }
  }
  // If still looks like a Django-wrapped external URL after failed decoding
  else if (url.includes('/media/http')) {
    console.log(`[getOptimizedImageUrl] Potential encapsulated URL detected: ${url}`);
    // Try to extract anything that looks like an URL after /media/
    const matches = url.match(/\/media\/(https?:\/\/.+)/i);
    if (matches && matches[1]) {
      console.log(`[getOptimizedImageUrl] Extracted encapsulated URL: ${matches[1]}`);
      finalUrl = matches[1];
    }
  }
  // If it's already an absolute URL
  else if (url.startsWith('http')) {
    console.log('[getOptimizedImageUrl] URL is already absolute');
    
    // If we're on the server and URL contains localhost:8000, replace with django:8000
    if (isServer && (
      url.includes('localhost:8000') || 
      url.includes('127.0.0.1:8000') || 
      url.includes('[::1]:8000')
    )) {
      finalUrl = url.replace(/https?:\/\/(localhost|127\.0\.0\.1|\[::1\]):8000/g, 'http://django:8000');
      console.log(`[getOptimizedImageUrl] Replaced localhost with django: ${finalUrl}`);
    }
  } else {
    // For relative URLs
    if (url.startsWith('/')) {
      // URL has leading slash like "/media/..."
      const baseUrl = isServer ? 'http://django:8000' : 'http://localhost:8000';
      finalUrl = `${baseUrl}${url}`;
      console.log(`[getOptimizedImageUrl] Added base URL to path with leading slash: ${finalUrl}`);
    } else {
      // URL has no leading slash
      const baseUrl = isServer ? 'http://django:8000/' : 'http://localhost:8000/';
      finalUrl = `${baseUrl}${url}`;
      console.log(`[getOptimizedImageUrl] Added base URL to path without leading slash: ${finalUrl}`);
    }
  }
  
  console.log(`[getOptimizedImageUrl] Final URL: ${finalUrl}`);
  return finalUrl;
} 