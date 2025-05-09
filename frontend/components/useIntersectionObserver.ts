import { useRef, useEffect, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  enabled?: boolean;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
}

/**
 * Custom hook for IntersectionObserver with improved stability and debugging
 * Supports dynamic enabling/disabling and cleanup on unmount
 */
export default function useIntersectionObserver({
  threshold = 0.1,
  root = null,
  rootMargin = '0px',
  enabled = true,
  onIntersect
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [_entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  
  // Use refs to avoid recreating the observer unnecessarily
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<Element | null>(null);
  const onIntersectRef = useRef(onIntersect);
  
  // Update the callback ref when the callback changes
  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);
  
  // Clean up function to reset state
  const cleanup = useCallback(() => {
    if (observerRef.current && targetRef.current) {
      observerRef.current.unobserve(targetRef.current);
      observerRef.current.disconnect();
    }
    observerRef.current = null;
  }, []);
  
  // Setup observer on mount if enabled
  useEffect(() => {
    // Skip if disabled, browser doesn't support IntersectionObserver, or we're in SSR
    if (!enabled || typeof IntersectionObserver === 'undefined' || typeof window === 'undefined') {
      return cleanup;
    }
    
    // Create new IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // Update state
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
        
        // Call onIntersect callback if available and target is intersecting
        if (entry.isIntersecting && onIntersectRef.current) {
          onIntersectRef.current(entry);
        }
      },
      { threshold, root, rootMargin }
    );
    
    return cleanup;
  }, [enabled, threshold, root, rootMargin, cleanup]);
  
  // Observer reference function to be attached to the target element
  const observe = useCallback((element: Element | null) => {
    if (!element || !enabled) return;
    
    // Clean up previous observations
    cleanup();
    
    // Set target element
    targetRef.current = element;
    
    // Start observing
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, [enabled, cleanup]);
  
  return {
    isIntersecting,
    entry: _entry,
    observe,
    unobserve: cleanup,
  };
} 