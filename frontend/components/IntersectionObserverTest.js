/**
 * Test utility to help debug and monitor IntersectionObserver behavior
 * Used to test the infinite scroll functionality
 */

// Store original IntersectionObserver
const OriginalIntersectionObserver = global.IntersectionObserver;

// Log level constants
const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
};

// Default to INFO level in development, ERROR in production
const DEFAULT_LOG_LEVEL = process.env.NODE_ENV === 'development' ? LOG_LEVELS.INFO : LOG_LEVELS.ERROR;

// Initialize observer tracking variables at module level
let observerCount = 0;
let activeObservers = new Map();

/**
 * Monkey patch IntersectionObserver for testing and debugging
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable the test utility
 * @param {number} options.logLevel - Logging level (0-4)
 * @param {function} options.onIntersection - Callback when intersection is detected
 * @param {boolean} options.simulateSlowNetwork - Add artificial delay to intersection events
 * @returns {function} - Function to restore original IntersectionObserver
 */
export function setupIntersectionObserverTest({
  enabled = true,
  logLevel = DEFAULT_LOG_LEVEL,
  onIntersection = null,
  simulateSlowNetwork = false
} = {}) {
  if (!enabled) return () => {};
  
  // Skip if running on server
  if (typeof window === 'undefined') return () => {};
  
  const log = (level, ...args) => {
    if (level <= logLevel) {
      const prefix = `[IntersectionObserver Test] `;
      switch (level) {
        case LOG_LEVELS.ERROR:
          console.error(prefix, ...args);
          break;
        case LOG_LEVELS.WARN:
          console.warn(prefix, ...args);
          break;
        case LOG_LEVELS.INFO:
          console.info(prefix, ...args);
          break;
        case LOG_LEVELS.DEBUG:
          console.log(prefix, ...args);
          break;
      }
    }
  };
  
  class MockIntersectionObserver {
    constructor(callback, options = {}) {
      this.id = ++observerCount;
      this.callback = callback;
      this.options = options;
      this.elements = new Set();
      
      activeObservers.set(this.id, this);
      
      log(LOG_LEVELS.INFO, `Observer #${this.id} created with options:`, options);
    }
    
    observe(element) {
      this.elements.add(element);
      log(LOG_LEVELS.DEBUG, `Observer #${this.id} observing element:`, element);
      
      // Use original observer but wrap callback to add debugging
      this._realObserver = new OriginalIntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          log(LOG_LEVELS.INFO, `Observer #${this.id} intersection:`, {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            target: entry.target
          });
          
          if (onIntersection) {
            onIntersection(entry, this);
          }
        });
        
        if (simulateSlowNetwork) {
          log(LOG_LEVELS.INFO, `Simulating slow network (500ms delay)`);
          setTimeout(() => this.callback(entries, observer), 500);
        } else {
          this.callback(entries, observer);
        }
      }, this.options);
      
      this._realObserver.observe(element);
    }
    
    unobserve(element) {
      this.elements.delete(element);
      log(LOG_LEVELS.DEBUG, `Observer #${this.id} stopped observing element:`, element);
      if (this._realObserver) {
        this._realObserver.unobserve(element);
      }
    }
    
    disconnect() {
      log(LOG_LEVELS.INFO, `Observer #${this.id} disconnected`);
      this.elements.clear();
      if (this._realObserver) {
        this._realObserver.disconnect();
      }
      activeObservers.delete(this.id);
    }
  }
  
  // Replace IntersectionObserver with our mock
  global.IntersectionObserver = MockIntersectionObserver;
  
  // Return function to restore original
  return function restore() {
    global.IntersectionObserver = OriginalIntersectionObserver;
    log(LOG_LEVELS.INFO, `Original IntersectionObserver restored`);
  };
}

/**
 * Get diagnostic information about active observers
 */
export function getIntersectionObserverStats() {
  if (typeof window === 'undefined') return {};
  
  return {
    isPatched: global.IntersectionObserver !== OriginalIntersectionObserver,
    activeObservers: activeObservers ? activeObservers.size : 0,
    observers: activeObservers ? Array.from(activeObservers.entries()).map(([id, observer]) => ({
      id,
      options: observer.options,
      elementCount: observer.elements.size
    })) : []
  };
}

/**
 * Log level constants
 */
export { LOG_LEVELS }; 