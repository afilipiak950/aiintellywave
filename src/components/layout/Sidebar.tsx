
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createNavItems } from './SidebarNavItems';
import { useTranslation } from '../../hooks/useTranslation';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNav } from './sidebar/SidebarNav';
import { SidebarFooter } from './sidebar/SidebarFooter';

interface SidebarProps {
  role: 'admin' | 'manager' | 'customer';
}

const Sidebar = ({ role }: SidebarProps) => {
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { translationDict, t } = useTranslation();

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Get navigation items based on role
  const navItems = createNavItems(translationDict)[role];

  return (
    <aside 
      className={`bg-sidebar h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ease-in-out z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <SidebarHeader 
        role={role} 
        collapsed={collapsed} 
        toggleSidebar={toggleSidebar} 
      />
      
      <SidebarNav 
        navItems={navItems} 
        collapsed={collapsed} 
      />
      
      <SidebarFooter 
        collapsed={collapsed} 
        onSignOut={signOut} 
        t={t} 
      />
    </aside>
  );
};

export default Sidebar;
