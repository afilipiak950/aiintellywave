
import React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNavActiveState } from '@/hooks/use-nav-active-state';
import { useIsMobile } from '@/hooks/use-mobile';
import SidebarNav from './sidebar/SidebarNav';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarFooter } from './sidebar/SidebarFooter';
import SidebarNavItems from './SidebarNavItems';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarProvider
} from '@/components/ui/sidebar';

interface SidebarProps {
  role: 'admin' | 'manager' | 'customer';
}

const Sidebar = ({ role }: SidebarProps) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  const activeState = useNavActiveState();
  const isMobile = useIsMobile();
  
  const navItems = SidebarNavItems({ role, location });
  
  return (
    <SidebarProvider defaultOpen={!collapsed}>
      <ShadcnSidebar>
        <SidebarHeader 
          role={role}
          collapsed={collapsed} 
          toggleSidebar={() => setCollapsed(!collapsed)} 
        />
        
        <SidebarContent className="flex flex-col flex-1">
          <div className="flex-1 overflow-auto py-2">
            <SidebarNav
              links={navItems}
              collapsed={collapsed}
            />
          </div>
          
          <SidebarFooter collapsed={collapsed} />
        </SidebarContent>
      </ShadcnSidebar>
    </SidebarProvider>
  );
};

export default Sidebar;
