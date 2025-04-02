
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export function useNavActiveState() {
  const location = useLocation();
  const currentPath = location.pathname;

  /**
   * Check if a navigation item is active based on its path
   * @param path The path to check
   * @returns Whether the path is active
   */
  const isActive = useCallback(
    (path?: string) => {
      if (!path) return false;
      
      // Remove trailing slashes for consistent comparison
      const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
      const normalizedCurrentPath = currentPath.endsWith('/') 
        ? currentPath.slice(0, -1) 
        : currentPath;
      
      // Exact match
      if (normalizedPath === normalizedCurrentPath) return true;
      
      // Special handling for settings subpaths
      if (normalizedPath.includes('/settings') && normalizedCurrentPath.includes('/settings')) {
        return true;
      }
      
      // Handle the case where the path is a parent of the current path
      // and the current path is not just the root path
      if (normalizedCurrentPath.startsWith(normalizedPath) && 
          normalizedPath !== '/' && 
          normalizedCurrentPath !== normalizedPath) {
        // Check if the next character after the path is a slash
        // This ensures we don't match e.g. "/projects" when the current path is "/projects-archive"
        const nextChar = normalizedCurrentPath.charAt(normalizedPath.length);
        return nextChar === '/' || nextChar === '';
      }
      
      return false;
    },
    [currentPath]
  );

  return { isActive, currentPath };
}
