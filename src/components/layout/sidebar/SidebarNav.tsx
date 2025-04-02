
import React, { useEffect, useState } from 'react';
import { NavItem } from '../navigation/types';
import { useManagerKPIStatus } from '@/hooks/use-manager-kpi-status';
import { useNavActiveState } from '@/hooks/use-nav-active-state';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarNavLoading } from './SidebarNavLoading';
import { toast } from '@/hooks/use-toast';

interface SidebarNavProps {
  navItems: NavItem[];
  collapsed: boolean;
}

export const SidebarNav = ({ navItems: initialNavItems, collapsed }: SidebarNavProps) => {
  const { navItems, isLoading, hasKpiEnabled, refreshNavItems, userId } = useManagerKPIStatus(initialNavItems);
  const { isActive, currentPath } = useNavActiveState();
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);
  
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
    
    // If there's a mismatch between the KPI status and whether the item exists
    if (hasKpiEnabled && !hasManagerKPI && forceRefreshCounter < 3) {
      console.warn('[SidebarNav] ERROR: KPI is enabled but Manager KPI item is missing! Attempt:', forceRefreshCounter + 1);
      
      // Force refresh to fix the issue after a short delay
      setTimeout(() => {
        setForceRefreshCounter(prev => prev + 1);
        refreshNavItems();
        
        // Notify user of the issue if we've tried multiple times
        if (forceRefreshCounter === 2) {
          toast({
            title: "Navigation issue detected",
            description: "Some menu items may not be showing correctly. Please refresh the page if needed.",
            variant: "default"
          });
        }
      }, 500);
    }
  }, [navItems, currentPath, hasKpiEnabled, refreshNavItems, forceRefreshCounter, userId]);
  
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
    <div className="flex-1 overflow-y-auto py-2">
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
