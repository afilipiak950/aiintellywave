
import React from 'react';
import {
  Users,
  Home,
  FileText,
  Settings,
  UserCog,
  BarChart4,
  Building,
  Table
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  path?: string;
}

interface NavItemsByRole {
  admin: NavItem[];
  manager: NavItem[];
  customer: NavItem[];
}

export const NAV_ITEMS: NavItemsByRole = {
  admin: [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      path: '/admin/dashboard',
      icon: Home,
    },
    {
      name: 'Revenue',
      href: '/admin/revenue',
      path: '/admin/revenue',
      icon: BarChart4,
    },
    {
      name: 'Kunden Tabelle',
      href: '/admin/customer-table',
      path: '/admin/customer-table',
      icon: Table,
    },
    {
      name: 'Customers',
      href: '/admin/customers',
      path: '/admin/customers',
      icon: Users,
    },
    {
      name: 'Companies & Customers',
      href: '/admin/companies-customers',
      path: '/admin/companies-customers',
      icon: Building,
    },
    {
      name: 'Projects',
      href: '/admin/projects',
      path: '/admin/projects',
      icon: FileText,
    },
    {
      name: 'Settings',
      href: '/admin/settings/profile',
      path: '/admin/settings',
      icon: Settings,
    },
  ],
  manager: [
    {
      name: 'Dashboard',
      href: '/manager/dashboard',
      path: '/manager/dashboard',
      icon: Home,
    },
    {
      name: 'Customers',
      href: '/manager/customers',
      path: '/manager/customers',
      icon: Users,
    },
    {
      name: 'KI Personas',
      href: '/manager/ki-personas',
      path: '/manager/ki-personas',
      icon: UserCog,
    },
    {
      name: 'Projects',
      href: '/manager/projects',
      path: '/manager/projects',
      icon: FileText,
    },
    {
      name: 'Settings',
      href: '/manager/settings/profile',
      path: '/manager/settings',
      icon: Settings,
    },
  ],
  customer: [
    {
      name: 'Dashboard',
      href: '/customer/dashboard',
      path: '/customer/dashboard',
      icon: Home,
    },
    {
      name: 'Profile',
      href: '/customer/profile',
      path: '/customer/profile',
      icon: UserCog,
    },
    {
      name: 'Projects',
      href: '/customer/projects',
      path: '/customer/projects',
      icon: FileText,
    },
    {
      name: 'Settings',
      href: '/customer/settings/profile',
      path: '/customer/settings',
      icon: Settings,
    },
  ],
};

// Add the createNavItems function that was missing
export const createNavItems = (translations: any) => {
  // If we have translations, we could apply them here
  // For now, just return the nav items as they are
  return NAV_ITEMS;
};
