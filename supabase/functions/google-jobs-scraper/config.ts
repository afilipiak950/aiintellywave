
/**
 * Configuration settings for Google Jobs scraper
 */

// Project ID from config.toml
export const PROJECT_ID = 'ootziscicbahucatxyme';

// User agent for browser requests
export const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';

// Default search parameters
export const DEFAULT_SEARCH_PARAMS = {
  maxResults: 50,
  language: 'de',
};

// Scraper settings
export const SCRAPER_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
};
