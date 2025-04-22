
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavActiveState } from '@/hooks/use-nav-active-state';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarFooter } from './sidebar/SidebarFooter';
import SidebarNav from './sidebar/SidebarNav';
import { useIsMobile } from '@/hooks/use-mobile';
import SidebarNavItems from './SidebarNavItems';

interface SidebarProps {
  role: 'admin' | 'manager' | 'customer';
}

const Sidebar = ({ role }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const activeState = useNavActiveState();
  const isMobile = useIsMobile();
  
  const navItems = SidebarNavItems({ role, location });
  
  return (
    <aside 
      className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out shadow-lg
                 ${collapsed ? 'w-16' : 'w-64'} bg-sidebar text-sidebar-foreground`}
    >
      <div className="flex flex-col h-full">
        <SidebarHeader 
          role={role}
          collapsed={collapsed} 
          toggleSidebar={() => setCollapsed(!collapsed)} 
        />
        
        <div className="flex-1 overflow-y-auto">
          <SidebarNav
            links={navItems}
            collapsed={collapsed}
          />
        </div>
        
        <SidebarFooter collapsed={collapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
