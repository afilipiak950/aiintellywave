
import React, { useEffect } from 'react';
import { NavItem } from '../SidebarNavItems';
import { useManagerKPIStatus } from '@/hooks/use-manager-kpi-status';
import { useNavActiveState } from '@/hooks/use-nav-active-state';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarNavLoading } from './SidebarNavLoading';

interface SidebarNavProps {
  navItems: NavItem[];
  collapsed: boolean;
}

export const SidebarNav = ({ navItems: initialNavItems, collapsed }: SidebarNavProps) => {
  const { navItems, isLoading, hasKpiEnabled, refreshNavItems } = useManagerKPIStatus(initialNavItems);
  const { isActive, currentPath } = useNavActiveState();
  
  // Enhanced debugging for navigation items
  useEffect(() => {
    console.log('SidebarNav: Current path:', currentPath);
    console.log('SidebarNav: Has KPI enabled (from hook):', hasKpiEnabled);
    console.log('SidebarNav: Current navItems count:', navItems.length);
    
    // Check specifically if Manager KPI item exists
    const hasManagerKPI = navItems.some(item => item.path === '/customer/manager-kpi');
    console.log('SidebarNav: Has Manager KPI nav item:', hasManagerKPI);
    
    // Log all nav paths for debugging
    console.log('SidebarNav: All nav paths:', navItems.map(item => item.path));
    
    // If there's a mismatch between the KPI status and whether the item exists
    if (hasKpiEnabled && !hasManagerKPI) {
      console.warn('CRITICAL ERROR: KPI is enabled but Manager KPI item is missing!');
      console.log('SidebarNav: Forcing manual refresh of nav items');
      
      // Force refresh to fix the issue
      setTimeout(() => refreshNavItems(), 500);
    }
  }, [navItems, currentPath, hasKpiEnabled, refreshNavItems]);
  
  // Force a refresh when component mounts and when path changes
  useEffect(() => {
    console.log('SidebarNav: Component mounted or path changed, refreshing nav items');
    refreshNavItems();
  }, [refreshNavItems, currentPath]);
  
  return (
    <div className="flex-1 overflow-y-auto py-6">
      <nav className="px-2 space-y-1">
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
      </nav>
    </div>
  );
};
