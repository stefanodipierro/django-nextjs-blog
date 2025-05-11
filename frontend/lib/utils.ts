/**
 * Utility functions for the frontend
 */

// Site URL from environment variable with fallback
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
      
      // Fix the common issue with https:/picsum.photos -> https://picsum.photos
      let fixedUrl = decodedUrl;
      if (decodedUrl.includes('https:/picsum')) {
        fixedUrl = decodedUrl.replace('https:/picsum', 'https://picsum');
      }
      if (decodedUrl.includes('http:/picsum')) {
        fixedUrl = decodedUrl.replace('http:/picsum', 'http://picsum');
      }
      
      finalUrl = fixedUrl;
    }
  }
  // If still looks like a Django-wrapped external URL after failed decoding
  else if (url.includes('/media/http')) {
    console.log(`[getOptimizedImageUrl] Potential encapsulated URL detected: ${url}`);
    // Try to extract anything that looks like an URL after /media/
    const matches = url.match(/\/media\/(https?:\/\/.+)/i);
    if (matches && matches[1]) {
      console.log(`[getOptimizedImageUrl] Extracted encapsulated URL: ${matches[1]}`);
      
      // Fix URL if needed
      let extractedUrl = matches[1];
      if (extractedUrl.includes('https:/picsum')) {
        extractedUrl = extractedUrl.replace('https:/picsum', 'https://picsum');
      }
      if (extractedUrl.includes('http:/picsum')) {
        extractedUrl = extractedUrl.replace('http:/picsum', 'http://picsum');
      }
      
      finalUrl = extractedUrl;
    }
  }
  // If it's already an absolute URL
  else if (url.startsWith('http')) {
    console.log('[getOptimizedImageUrl] URL is already absolute');
    
    // Fix the URL format if needed
    if (url.includes('https:/picsum')) {
      finalUrl = url.replace('https:/picsum', 'https://picsum');
    }
    if (url.includes('http:/picsum')) {
      finalUrl = url.replace('http:/picsum', 'http://picsum');
    }
    
    // If we're on the server and URL contains localhost:8000, replace with django:8000
    if (isServer && (
      url.includes('localhost:8000') || 
      url.includes('127.0.0.1:8000') || 
      url.includes('[::1]:8000')
    )) {
      finalUrl = finalUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1|\[::1\]):8000/g, 'http://django:8000');
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

/**
 * Returns a publicly accessible URL for meta tags and social sharing
 * 
 * This function transforms internal URLs (django:8000, localhost:8000) to public URLs,
 * and handles decoding of encoded external URLs for social media sharing.
 * 
 * @param url The image URL to transform
 * @returns Public-friendly URL for meta tags
 */
export function getPublicImageUrl(url: string | null): string {
  if (!url) return '';
  
  // If it's already an absolute URL from a public source (like Picsum)
  if (url.startsWith('http') && !url.includes('django:8000') && !url.includes('localhost:8000')) {
    // Fix URL format if needed
    let fixedUrl = url;
    if (url.includes('https:/picsum')) {
      fixedUrl = url.replace('https:/picsum', 'https://picsum');
    }
    if (url.includes('http:/picsum')) {
      fixedUrl = url.replace('http:/picsum', 'http://picsum');
    }
    
    // Check if it's an external URL that needs decoding
    if (fixedUrl.includes('%3A') || fixedUrl.includes('%2F')) {
      fixedUrl = decodeURIComponent(fixedUrl);
    }
    
    return fixedUrl;
  }
  
  // Check for encoded or encapsulated external URLs
  // Pattern 1: http://django:8000/media/https%3A/picsum.photos/...
  const encodedExternalUrlMatch = url.match(/https?:\/\/[^\/]+\/media\/(https?(%3A|:).+)/i);
  if (encodedExternalUrlMatch) {
    const encodedPart = encodedExternalUrlMatch[1];
    // Try to extract and decode the actual external URL
    const decodedUrl = decodeURIComponent(encodedPart.replace(/%3A/g, ':'));
    if (decodedUrl.startsWith('http')) {
      // Fix the URL format
      if (decodedUrl.includes('https:/picsum')) {
        return decodedUrl.replace('https:/picsum', 'https://picsum');
      }
      if (decodedUrl.includes('http:/picsum')) {
        return decodedUrl.replace('http:/picsum', 'http://picsum');
      }
      return decodedUrl;
    }
  }
  
  // Pattern 2: http://django:8000/media/http:/picsum.photos/...
  const directExternalUrlMatch = url.match(/https?:\/\/[^\/]+\/media\/(https?:\/\/.+)/i);
  if (directExternalUrlMatch && directExternalUrlMatch[1]) {
    let extractedUrl = directExternalUrlMatch[1];
    // Fix the URL format
    if (extractedUrl.includes('https:/picsum')) {
      extractedUrl = extractedUrl.replace('https:/picsum', 'https://picsum');
    }
    if (extractedUrl.includes('http:/picsum')) {
      extractedUrl = extractedUrl.replace('http:/picsum', 'http://picsum');
    }
    return extractedUrl;
  }
  
  // If it's an internal URL (starting with http://django:8000 or http://localhost:8000)
  if (url.includes('django:8000')) {
    return url.replace('http://django:8000', 'http://localhost:8000');
  }
  
  // For relative URLs, prepend the public site URL (for meta tags)
  if (url.startsWith('/')) {
    // If it's a media URL from Django but doesn't contain an external URL
    if (url.startsWith('/media/') && !url.includes('http')) {
      return `http://localhost:8000${url}`;
    }
    return `${SITE_URL}${url}`;
  } else {
    // If it's a media URL from Django but doesn't contain an external URL
    if (url.startsWith('media/') && !url.includes('http')) {
      return `http://localhost:8000/${url}`;
    }
    return `${SITE_URL}/${url}`;
  }
}

/**
 * Generates a canonical URL for a page
 * 
 * @param path The path of the page (e.g., '/posts/my-post')
 * @returns Absolute canonical URL
 */
export function getCanonicalUrl(path: string): string {
  // Ensure path starts with '/' and remove any trailing '/'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
} 