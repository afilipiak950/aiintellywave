
import React, { useEffect } from 'react';
import { NavItem } from '../navigation/types';
import { useManagerKPIStatus } from '@/hooks/use-manager-kpi-status';
import { useNavActiveState } from '@/hooks/use-nav-active-state';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarNavLoading } from './SidebarNavLoading';
import { toast } from '@/hooks/use-toast';
import { 
  SidebarMenu,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

interface SidebarNavProps {
  navItems: NavItem[];
  collapsed: boolean;
}

export const SidebarNav = ({ navItems: initialNavItems, collapsed }: SidebarNavProps) => {
  const { navItems, isLoading, hasKpiEnabled, refreshNavItems, userId } = useManagerKPIStatus(initialNavItems);
  const { isActive, currentPath } = useNavActiveState();
  
  // Enhanced debugging for navigation items and KPI status
  useEffect(() => {
    console.log('[SidebarNav] Current path:', currentPath);
    console.log('[SidebarNav] User ID:', userId);
    console.log('[SidebarNav] Has KPI enabled (from hook):', hasKpiEnabled);
    console.log('[SidebarNav] Current navItems count:', navItems.length);
    
    // Check specifically if Manager KPI item exists
    const hasManagerKPI = navItems.some(item => item.path === '/customer/manager-kpi');
    console.log('[SidebarNav] Has Manager KPI nav item:', hasManagerKPI);
    
    // Log all nav paths for debugging
    console.log('[SidebarNav] All nav paths:', navItems.map(item => item.path));
  }, [navItems, currentPath, hasKpiEnabled, userId]);
  
  // Force a refresh when component mounts
  useEffect(() => {
    console.log('[SidebarNav] Component mounted, refreshing nav items');
    refreshNavItems();
  }, [refreshNavItems]);
  
  // Additional refresh when path changes
  useEffect(() => {
    console.log('[SidebarNav] Path changed to:', currentPath);
    if (currentPath.includes('manager-kpi') && !navItems.some(item => item.path === '/customer/manager-kpi')) {
      console.log('[SidebarNav] On manager-kpi page but nav item is missing, forcing refresh');
      refreshNavItems();
    }
  }, [currentPath, navItems, refreshNavItems]);
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading ? (
            <SidebarNavLoading />
          ) : (
            navItems.map((item) => (
              <SidebarNavItem 
                key={item.path || `nav-item-${item.name}`}
                item={item}
                isActive={isActive(item.path)}
                collapsed={collapsed}
              />
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
