
import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const ManagerLayout = () => {
  const visibilityRef = useRef(document.visibilityState);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const prevVisibility = visibilityRef.current;
      const currentVisibility = document.visibilityState;
      visibilityRef.current = currentVisibility;
      
      console.log(`[ManagerLayout] Visibility changed: ${prevVisibility} -> ${currentVisibility}`);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check for saved sidebar state on mount
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
    
    // Handle resize events for responsive behavior
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Check initial size
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle sidebar state change
  const handleSidebarStateChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar 
        role="manager" 
        collapsed={sidebarCollapsed}
        onStateChange={handleSidebarStateChange}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'ml-16' : 'ml-0 md:ml-64'
      }`}>
        <Header />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
