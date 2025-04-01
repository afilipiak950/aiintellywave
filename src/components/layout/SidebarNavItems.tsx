
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
  BrainCircuit
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

// Define base paths for each role to avoid hardcoding
const PATHS = {
  admin: '/admin',
  manager: '/manager',
  customer: '/customer',
} as const;

// Common navigation item types that are shared across roles
type RoleType = keyof typeof PATHS;

// Factory function to create navigation items with the correct role prefix
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

// Define common navigation items that appear in multiple roles
const createCommonItems = (role: RoleType): NavItem[] => [
  createNavItem(role, 'Dashboard', 'dashboard', Home),
  createNavItem(role, 'Projects', 'projects', FileText),
  createNavItem(role, 'Settings', 'settings/profile', Settings),
];

interface NavItemsByRole {
  admin: NavItem[];
  manager: NavItem[];
  customer: NavItem[];
}

// Create the navigation items for each role
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
    createNavItem('customer', 'KI Personas', 'ki-personas', UserCog),
    createNavItem('customer', 'Statistics', 'statistics', LineChart, { text: 'Soon', variant: 'default' }),
    createNavItem('customer', 'Outreach', 'outreach', Network, { text: 'Soon', variant: 'default' }),
    createNavItem('customer', 'Profile', 'profile', Users),
  ],
};

export const createNavItems = (translations: any) => {
  // In the future, translations could be applied here
  return NAV_ITEMS;
};
