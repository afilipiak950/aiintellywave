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
  const customerNavItems = NAV_ITEMS.customer.slice(); // Create a copy

  // Add a function to check if Manager KPI is enabled
  const addManagerKPIItem = async (navItems: NavItem[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navItems;

      const { data: companyUserData, error } = await supabase
        .from('company_users')
        .select('is_manager_kpi_enabled')
        .eq('user_id', user.id)
        .single();

      if (error || !companyUserData) return navItems;

      if (companyUserData.is_manager_kpi_enabled) {
        navItems.push(
          createNavItem('customer', 'Manager KPI', 'manager-kpi', BarChart)
        );
      }

      return navItems;
    } catch (error) {
      console.error('Error checking Manager KPI access:', error);
      return navItems;
    }
  };

  // Modify the existing NAV_ITEMS
  NAV_ITEMS.customer = addManagerKPIItem(customerNavItems);

  return NAV_ITEMS;
};
