
import { NavItemsByRole } from './types';

export const NAV_ITEMS: NavItemsByRole = {
  admin: [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: 'layout-dashboard',
    },
    {
      name: 'Projekte',
      path: '/admin/projects',
      icon: 'folder',
    },
    {
      name: 'Kunden',
      path: '/admin/customers',
      icon: 'users',
    },
    {
      name: 'Umsatz',
      path: '/admin/revenue',
      icon: 'credit-card',
    },
  ],
  manager: [
    {
      name: 'Dashboard',
      path: '/manager/dashboard',
      icon: 'layout-dashboard',
    },
    {
      name: 'Projekte',
      path: '/manager/projects',
      icon: 'folder',
    },
    {
      name: 'Kunden',
      path: '/manager/customers',
      icon: 'users',
    },
    {
      name: 'Pipeline',
      path: '/manager/pipeline',
      icon: 'git-branch',
    },
    {
      name: 'Lead-Datenbank',
      path: '/manager/lead-database',
      icon: 'database',
    },
    {
      name: 'Mira AI',
      path: '/manager/mira-ai',
      icon: 'bot',
    },
    {
      name: 'KI-Personas',
      path: '/manager/ki-personas',
      icon: 'user-cog',
    },
    {
      name: 'AI Training',
      path: '/manager/train-ai',
      icon: 'graduation-cap',
    },
    {
      name: 'Workflows',
      path: '/manager/workflows',
      icon: 'workflow',
    },
  ],
  customer: [
    {
      name: 'Dashboard',
      path: '/customer/dashboard',
      icon: 'layout-dashboard',
    },
    {
      name: 'Projekte',
      path: '/customer/projects',
      icon: 'folder',
    },
    {
      name: 'Pipeline',
      path: '/customer/pipeline',
      icon: 'git-branch',
    },
    {
      name: 'Lead-Datenbank',
      path: '/customer/lead-database',
      icon: 'database',
    },
    {
      name: 'Mira AI',
      path: '/customer/mira-ai',
      icon: 'bot',
    },
     {
      name: 'KI-Personas',
      path: '/customer/ki-personas',
      icon: 'user-cog',
    },
    {
      name: 'AI Training',
      path: '/customer/train-ai',
      icon: 'graduation-cap',
    },
    {
      name: 'Termine',
      path: '/customer/appointments',
      icon: 'calendar',
    },
    {
      name: 'Statistiken',
      path: '/customer/statistics',
      icon: 'bar-chart',
    },
    {
      name: 'Outreach',
      path: '/customer/outreach',
      icon: 'mail',
    },
  ],
};

// This is the missing export that's causing the error
export const MANAGER_KPI_ITEM = {
  name: 'Manager KPI',
  path: '/customer/manager-kpi',
  icon: 'chart-bar',
};
