
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

  const handleSidebarStateChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        role="admin" 
      />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
