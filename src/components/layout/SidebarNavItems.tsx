
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

interface NavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
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
      icon: Home,
    },
    {
      name: 'Revenue',
      href: '/admin/revenue',
      icon: BarChart4,
    },
    {
      name: 'Kunden Tabelle',
      href: '/admin/customer-table',
      icon: Table,
    },
    {
      name: 'Customers',
      href: '/admin/customers',
      icon: Users,
    },
    {
      name: 'Companies & Customers',
      href: '/admin/companies-customers',
      icon: Building,
    },
    {
      name: 'Projects',
      href: '/admin/projects',
      icon: FileText,
    },
    {
      name: 'Settings',
      href: '/admin/settings/profile',
      icon: Settings,
    },
  ],
  manager: [
    {
      name: 'Dashboard',
      href: '/manager/dashboard',
      icon: Home,
    },
    {
      name: 'Customers',
      href: '/manager/customers',
      icon: Users,
    },
    {
      name: 'Projects',
      href: '/manager/projects',
      icon: FileText,
    },
    {
      name: 'Settings',
      href: '/manager/settings/profile',
      icon: Settings,
    },
  ],
  customer: [
    {
      name: 'Dashboard',
      href: '/customer/dashboard',
      icon: Home,
    },
    {
      name: 'Profile',
      href: '/customer/profile',
      icon: UserCog,
    },
    {
      name: 'Projects',
      href: '/customer/projects',
      icon: FileText,
    },
    {
      name: 'Settings',
      href: '/customer/settings/profile',
      icon: Settings,
    },
  ],
};
