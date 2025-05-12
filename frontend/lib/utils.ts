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
  
  // Fix any malformed URL protocols first (missing double slash)
  if (url.includes('https:/') && !url.includes('https://')) {
    finalUrl = url.replace(/https:\/([^\/])/g, 'https://$1');
    console.log(`[getOptimizedImageUrl] Fixed malformed https URL: ${finalUrl}`);
  }
  if (url.includes('http:/') && !url.includes('http://')) {
    finalUrl = url.replace(/http:\/([^\/])/g, 'http://$1');
    console.log(`[getOptimizedImageUrl] Fixed malformed http URL: ${finalUrl}`);
  }
  
  // Check for encoded external URLs (like http://django:8000/media/https%3A/picsum.photos/...)
  const encodedExternalUrlMatch = finalUrl.match(/https?:\/\/[^\/]+\/media\/(https?(%3A|:).+)/i);
  if (encodedExternalUrlMatch) {
    const encodedPart = encodedExternalUrlMatch[1];
    // Try to extract and decode the actual external URL
    const decodedUrl = decodeURIComponent(encodedPart.replace(/%3A/g, ':'));
    if (decodedUrl.startsWith('http')) {
      console.log(`[getOptimizedImageUrl] Detected encapsulated external URL: ${decodedUrl}`);
      
      // Fix the common issue with https:/picsum.photos -> https://picsum.photos
      let fixedUrl = decodedUrl;
      if (decodedUrl.includes('https:/') && !decodedUrl.includes('https://')) {
        fixedUrl = decodedUrl.replace(/https:\/([^\/])/g, 'https://$1');
      }
      if (decodedUrl.includes('http:/') && !decodedUrl.includes('http://')) {
        fixedUrl = decodedUrl.replace(/http:\/([^\/])/g, 'http://$1');
      }
      
      finalUrl = fixedUrl;
    }
  }
  // If still looks like a Django-wrapped external URL after failed decoding
  else if (finalUrl.includes('/media/http')) {
    console.log(`[getOptimizedImageUrl] Potential encapsulated URL detected: ${finalUrl}`);
    // Try to extract anything that looks like an URL after /media/
    const matches = finalUrl.match(/\/media\/(https?:\/\/.+)/i);
    if (matches && matches[1]) {
      console.log(`[getOptimizedImageUrl] Extracted encapsulated URL: ${matches[1]}`);
      
      // Fix URL if needed
      let extractedUrl = matches[1];
      if (extractedUrl.includes('https:/') && !extractedUrl.includes('https://')) {
        extractedUrl = extractedUrl.replace(/https:\/([^\/])/g, 'https://$1');
      }
      if (extractedUrl.includes('http:/') && !extractedUrl.includes('http://')) {
        extractedUrl = extractedUrl.replace(/http:\/([^\/])/g, 'http://$1');
      }
      
      finalUrl = extractedUrl;
    }
  }
  // If it's already an absolute URL
  else if (finalUrl.startsWith('http')) {
    console.log('[getOptimizedImageUrl] URL is already absolute');
    
    // If we're on the server and URL contains localhost:8000, replace with django:8000
    if (isServer && (
      finalUrl.includes('localhost:8000') || 
      finalUrl.includes('127.0.0.1:8000') || 
      finalUrl.includes('[::1]:8000')
    )) {
      finalUrl = finalUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1|\[::1\]):8000/g, 'http://django:8000');
      console.log(`[getOptimizedImageUrl] Replaced localhost with django: ${finalUrl}`);
    }
  } else {
    // For relative URLs
    if (finalUrl.startsWith('/')) {
      // URL has leading slash like "/media/..."
      const baseUrl = isServer ? 'http://django:8000' : 'http://localhost:8000';
      finalUrl = `${baseUrl}${finalUrl}`;
      console.log(`[getOptimizedImageUrl] Added base URL to path with leading slash: ${finalUrl}`);
    } else {
      // URL has no leading slash
      const baseUrl = isServer ? 'http://django:8000/' : 'http://localhost:8000/';
      finalUrl = `${baseUrl}${finalUrl}`;
      console.log(`[getOptimizedImageUrl] Added base URL to path without leading slash: ${finalUrl}`);
    }
  }
  
  // Force WebP for Picsum
  if (finalUrl && finalUrl.includes('picsum.photos') && !finalUrl.endsWith('.webp')) {
    // Only append .webp if not already present and if no extension is present
    if (!/\.(jpg|jpeg|png|webp|gif|svg)$/.test(finalUrl)) {
      finalUrl += '.webp';
    }
  }
  // Optionally, force WebP for Unsplash
  if (finalUrl && finalUrl.includes('images.unsplash.com') && !finalUrl.includes('fm=webp')) {
    finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'fm=webp';
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
  
  console.log(`[getPublicImageUrl] Processing URL: ${url}`);
  
  // Fix any malformed URL protocols first (missing double slash)
  let fixedUrl = url;
  if (url.includes('https:/') && !url.includes('https://')) {
    fixedUrl = url.replace(/https:\/([^\/])/g, 'https://$1');
    console.log(`[getPublicImageUrl] Fixed malformed https URL: ${url} -> ${fixedUrl}`);
  }
  if (url.includes('http:/') && !url.includes('http://')) {
    fixedUrl = url.replace(/http:\/([^\/])/g, 'http://$1');
    console.log(`[getPublicImageUrl] Fixed malformed http URL: ${url} -> ${fixedUrl}`);
  }
  
  // If it's already an absolute URL from a public source (like Picsum)
  if (fixedUrl.startsWith('http') && !fixedUrl.includes('django:8000') && !fixedUrl.includes('localhost:8000')) {
    // Check if it's an external URL that needs decoding
    if (fixedUrl.includes('%3A') || fixedUrl.includes('%2F')) {
      let decodedUrl = decodeURIComponent(fixedUrl);
      console.log(`[getPublicImageUrl] Decoded URL: ${fixedUrl} -> ${decodedUrl}`);
      fixedUrl = decodedUrl;
      
      // Check again for malformed URLs after decoding
      if (fixedUrl.includes('https:/') && !fixedUrl.includes('https://')) {
        let newFixedUrl = fixedUrl.replace(/https:\/([^\/])/g, 'https://$1');
        console.log(`[getPublicImageUrl] Fixed malformed https URL after decoding: ${fixedUrl} -> ${newFixedUrl}`);
        fixedUrl = newFixedUrl;
      }
      if (fixedUrl.includes('http:/') && !fixedUrl.includes('http://')) {
        let newFixedUrl = fixedUrl.replace(/http:\/([^\/])/g, 'http://$1');
        console.log(`[getPublicImageUrl] Fixed malformed http URL after decoding: ${fixedUrl} -> ${newFixedUrl}`);
        fixedUrl = newFixedUrl;
      }
    }
    
    console.log(`[getPublicImageUrl] Final URL: ${fixedUrl}`);
    return fixedUrl;
  }
  
  // Check for encoded or encapsulated external URLs
  // Pattern 1: http://django:8000/media/https%3A/picsum.photos/...
  const encodedExternalUrlMatch = fixedUrl.match(/https?:\/\/[^\/]+\/media\/(https?(%3A|:).+)/i);
  if (encodedExternalUrlMatch) {
    const encodedPart = encodedExternalUrlMatch[1];
    // Try to extract and decode the actual external URL
    const decodedUrl = decodeURIComponent(encodedPart.replace(/%3A/g, ':'));
    if (decodedUrl.startsWith('http')) {
      // Fix the URL format
      let extractedUrl = decodedUrl;
      if (decodedUrl.includes('https:/') && !decodedUrl.includes('https://')) {
        extractedUrl = decodedUrl.replace(/https:\/([^\/])/g, 'https://$1');
      }
      if (decodedUrl.includes('http:/') && !decodedUrl.includes('http://')) {
        extractedUrl = decodedUrl.replace(/http:\/([^\/])/g, 'http://$1');
      }
      return extractedUrl;
    }
  }
  
  // Pattern 2: http://django:8000/media/http:/picsum.photos/...
  const directExternalUrlMatch = fixedUrl.match(/https?:\/\/[^\/]+\/media\/(https?:\/\/.+)/i);
  if (directExternalUrlMatch && directExternalUrlMatch[1]) {
    let extractedUrl = directExternalUrlMatch[1];
    // Fix the URL format
    if (extractedUrl.includes('https:/') && !extractedUrl.includes('https://')) {
      extractedUrl = extractedUrl.replace(/https:\/([^\/])/g, 'https://$1');
    }
    if (extractedUrl.includes('http:/') && !extractedUrl.includes('http://')) {
      extractedUrl = extractedUrl.replace(/http:\/([^\/])/g, 'http://$1');
    }
    return extractedUrl;
  }
  
  // If it's an internal URL (starting with http://django:8000 or http://localhost:8000)
  if (fixedUrl.includes('django:8000')) {
    return fixedUrl.replace('http://django:8000', 'http://localhost:8000');
  }
  
  // For relative URLs, prepend the public site URL (for meta tags)
  if (fixedUrl.startsWith('/')) {
    // If it's a media URL from Django but doesn't contain an external URL
    if (fixedUrl.startsWith('/media/') && !fixedUrl.includes('http')) {
      return `http://localhost:8000${fixedUrl}`;
    }
    return `${SITE_URL}${fixedUrl}`;
  } else {
    // If it's a media URL from Django but doesn't contain an external URL
    if (fixedUrl.startsWith('media/') && !fixedUrl.includes('http')) {
      return `http://localhost:8000/${fixedUrl}`;
    }
    return `${SITE_URL}/${fixedUrl}`;
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