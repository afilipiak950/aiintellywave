
import React from 'react';
import {
  Users,
  Home,
  FileText,
  Settings,
  UserCog,
  BarChart4,
  Building,
  Table,
  Database,
  PieChart,
  CalendarClock,
  MessagesSquare,
  Network,
  LineChart,
  BrainCircuit,
  Bot,
  BarChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  path?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
}

const PATHS = {
  admin: '/admin',
  manager: '/manager',
  customer: '/customer'
} as const;

type RoleType = keyof typeof PATHS;

const createNavItem = (
  role: RoleType,
  name: string,
  path: string,
  icon: React.ForwardRefExoticComponent<any>,
  badge?: NavItem['badge']
): NavItem => {
  const fullPath = `${PATHS[role]}/${path}`;
  return {
    name,
    href: fullPath,
    path: fullPath,
    icon,
    ...(badge && { badge }),
  };
};

const createCommonItems = (role: RoleType): NavItem[] => [
  createNavItem(role, 'Dashboard', 'dashboard', Home),
  createNavItem(role, 'Projects', 'projects', FileText),
];

interface NavItemsByRole {
  admin: NavItem[];
  manager: NavItem[];
  customer: NavItem[];
}

export const NAV_ITEMS: NavItemsByRole = {
  admin: [
    ...createCommonItems('admin'),
    createNavItem('admin', 'Revenue', 'revenue', BarChart4),
    createNavItem('admin', 'Kunden Tabelle', 'customer-table', Table),
    createNavItem('admin', 'Customers', 'customers', Users),
    createNavItem('admin', 'Companies & Customers', 'companies-customers', Building),
  ],
  manager: [
    ...createCommonItems('manager'),
    createNavItem('manager', 'Customers', 'customers', Users),
    createNavItem('manager', 'KI Personas', 'ki-personas', UserCog),
  ],
  customer: [
    ...createCommonItems('customer'),
    createNavItem('customer', 'Lead Database', 'lead-database', Database),
    createNavItem('customer', 'Pipeline', 'pipeline', PieChart),
    createNavItem('customer', 'Appointments', 'appointments', CalendarClock),
    createNavItem('customer', 'Mira AI', 'mira-ai', BrainCircuit),
    createNavItem('customer', 'Train AI', 'train-ai', Bot),
    createNavItem('customer', 'KI Personas', 'ki-personas', UserCog),
    createNavItem('customer', 'Statistics', 'statistics', LineChart, { text: 'Soon', variant: 'default' }),
    createNavItem('customer', 'Outreach', 'outreach', Network, { text: 'Soon', variant: 'default' }),
    createNavItem('customer', 'Settings', 'settings/profile', Settings),
  ],
};

export const createNavItems = (translations: any) => {
  // Create a copy of customer nav items
  const customerNavItems = [...NAV_ITEMS.customer];

  // Return a modified version of NAV_ITEMS
  return {
    ...NAV_ITEMS,
    customer: customerNavItems,
  };
};

// Create a manager KPI nav item
const MANAGER_KPI_ITEM = createNavItem('customer', 'Manager KPI', 'manager-kpi', BarChart);

// This function should be used in the SidebarNav component to check and add the Manager KPI menu item if needed
export const addManagerKPINavItem = async (navItems: NavItem[]): Promise<NavItem[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navItems;

    // Get all records for this user (not using .single() due to potential multiple rows)
    const { data: companyUserData, error } = await supabase
      .from('company_users')
      .select('is_manager_kpi_enabled')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching Manager KPI status:', error);
      return [...navItems];
    }
    
    const itemsCopy = [...navItems];
    
    // Check if any row has the KPI enabled
    const isKpiEnabled = companyUserData?.some(row => row.is_manager_kpi_enabled);
    
    if (isKpiEnabled) {
      console.log('Manager KPI is enabled, adding to navigation');
      // Check if the Manager KPI item already exists
      const kpiExists = itemsCopy.some(item => item.path === '/customer/manager-kpi');
      
      if (!kpiExists) {
        // Insert the Manager KPI item before Settings (find last position before Settings)
        const settingsIndex = itemsCopy.findIndex(item => item.path?.includes('/settings'));
        if (settingsIndex !== -1) {
          // Insert before Settings
          itemsCopy.splice(settingsIndex, 0, MANAGER_KPI_ITEM);
        } else {
          // If no Settings item found, add to end
          itemsCopy.push(MANAGER_KPI_ITEM);
        }
      }
    } else {
      // Remove the Manager KPI item if it exists but should be disabled
      const kpiIndex = itemsCopy.findIndex(item => item.path === '/customer/manager-kpi');
      if (kpiIndex !== -1) {
        itemsCopy.splice(kpiIndex, 1);
      }
    }

    return itemsCopy;
  } catch (error) {
    console.error('Error checking Manager KPI access:', error);
    return [...navItems];
  }
};
