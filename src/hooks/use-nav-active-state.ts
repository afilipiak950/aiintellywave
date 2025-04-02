
import { useLocation } from 'react-router-dom';

export const useNavActiveState = () => {
  const location = useLocation();
  
  // Helper function to check if a nav item is active
  const isActive = (navPath: string | undefined) => {
    // If path is undefined, it can't be active
    if (!navPath) return false;
    
    // Fix for dashboard path - make it active when at the root of the role
    if (navPath.endsWith('/dashboard')) {
      const basePath = navPath.split('/dashboard')[0];
      if (location.pathname === basePath || location.pathname === `${basePath}/` || 
          location.pathname === navPath || location.pathname === `${navPath}/`) {
        return true;
      }
    }
    
    return location.pathname === navPath || location.pathname.startsWith(`${navPath}/`);
  };

  return { isActive, currentPath: location.pathname };
};
