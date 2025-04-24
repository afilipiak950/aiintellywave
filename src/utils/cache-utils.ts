
const CACHE_PREFIX = 'pipeline_';
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface CacheConfig {
  prefix?: string;
  duration?: number;
}

export const cacheUtils = {
  set: (key: string, data: any, config?: CacheConfig) => {
    const prefix = config?.prefix || CACHE_PREFIX;
    const cacheKey = `${prefix}${key}`;
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data,
        duration: config?.duration || DEFAULT_CACHE_DURATION
      }));
    } catch (err) {
      console.warn('Cache write failed:', err);
    }
  },

  get: (key: string, config?: CacheConfig): any | null => {
    const prefix = config?.prefix || CACHE_PREFIX;
    const cacheKey = `${prefix}${key}`;
    
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const { timestamp, data, duration } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > (duration || DEFAULT_CACHE_DURATION);
      
      if (isExpired) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (err) {
      console.warn('Cache read failed:', err);
      return null;
    }
  },

  clear: (key: string, config?: CacheConfig) => {
    const prefix = config?.prefix || CACHE_PREFIX;
    const cacheKey = `${prefix}${key}`;
    localStorage.removeItem(cacheKey);
  }
};
