
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
  
  // Add debug logging for navigation items and KPI status
  useEffect(() => {
    console.log('Current navItems:', navItems);
    console.log('Current path:', currentPath);
    console.log('Has KPI enabled (from hook):', hasKpiEnabled);
    
    // Check specifically if Manager KPI item exists
    const hasManagerKPI = navItems.some(item => item.path === '/customer/manager-kpi');
    console.log('Has Manager KPI nav item:', hasManagerKPI);
    
    // Detailed debug check for when there's a mismatch
    if (hasKpiEnabled && !hasManagerKPI) {
      console.warn('MISMATCH: KPI is enabled but Manager KPI item is missing!');
      
      // Check which items are present
      const itemNames = navItems.map(item => item.name).join(', ');
      console.log('Current nav item names:', itemNames);
    }
  }, [navItems, currentPath, hasKpiEnabled]);
  
  // Refresh navigation when path changes
  useEffect(() => {
    refreshNavItems();
  }, [currentPath, refreshNavItems]);
  
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
