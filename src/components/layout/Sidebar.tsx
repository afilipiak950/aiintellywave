
import { useMemo } from 'react';
import { NAV_ITEMS } from './navigation/constants';
import { createNavItems } from './navigation/utils';
import { useTranslation } from '../../hooks/useTranslation';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNav } from './sidebar/SidebarNav';
import { SidebarFooter } from './sidebar/SidebarFooter';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarRail
} from '@/components/ui/sidebar';
import { useAuth } from '../../context/auth';
import { useSidebar } from '@/components/ui/sidebar/sidebar-hooks';

interface SidebarProps {
  role: 'admin' | 'manager' | 'customer';
}

const Sidebar = ({ role }: SidebarProps) => {
  const { translationDict } = useTranslation();
  const { open, toggleSidebar } = useSidebar();
  const { signOut } = useAuth();

  // Get navigation items based on role
  const navItems = useMemo(() => createNavItems(translationDict)[role], [role, translationDict]);

  return (
    <ShadcnSidebar collapsible="icon" variant="sidebar" className="z-30">
      <SidebarHeader 
        role={role} 
        collapsed={!open} 
        toggleSidebar={toggleSidebar} 
      />
      <SidebarContent>
        <SidebarNav 
          navItems={navItems} 
          collapsed={!open} 
        />
      </SidebarContent>
      <SidebarFooter collapsed={!open} onSignOut={signOut} />
      <SidebarRail />
    </ShadcnSidebar>
  );
};

export default Sidebar;
