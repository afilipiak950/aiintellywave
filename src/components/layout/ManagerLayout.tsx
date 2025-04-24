
import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const ManagerLayout = () => {
  const visibilityRef = useRef(document.visibilityState);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const prevVisibility = visibilityRef.current;
      const currentVisibility = document.visibilityState;
      visibilityRef.current = currentVisibility;
      
      console.log(`[ManagerLayout] Visibility changed: ${prevVisibility} -> ${currentVisibility}`);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="manager" />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
