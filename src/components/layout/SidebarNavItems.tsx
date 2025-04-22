import React from 'react';
import { Location } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  PieChart, 
  Briefcase, 
  Zap,
  PencilRuler,
  Database,
  LineChart,
  Calendar
} from 'lucide-react';

interface SidebarNavItemsProps {
  role: 'admin' | 'manager' | 'customer';
  location: Location;
}

const SidebarNavItems = ({ role, location }: SidebarNavItemsProps) => {
  const path = location.pathname;

  // Admin Navigation Items
  if (role === 'admin') {
    return [
      {
        href: '/admin/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        active: path === '/admin/dashboard' || path === '/admin/'
      },
      {
        href: '/admin/customers',
        label: 'Customers',
        icon: Users,
        active: path.includes('/admin/customers')
      },
      {
        href: '/admin/projects',
        label: 'Projects',
        icon: Briefcase,
        active: path.includes('/admin/projects')
      },
      {
        href: '/admin/revenue',
        label: 'Revenue',
        icon: LineChart,
        active: path.includes('/admin/revenue')
      },
      {
        href: '/admin/search-strings',
        label: 'Search Strings',
        icon: FileText,
        active: path.includes('/admin/search-strings')
      },
      {
        href: '/admin/instantly',
        label: 'Instantly',
        icon: Zap,
        active: path.includes('/admin/instantly')
      }
      // KPI Dashboard wurde entfernt!
    ];
  }

  // Manager Navigation Items
  if (role === 'manager') {
    return [
      {
        href: '/manager/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        active: path === '/manager/dashboard' || path === '/manager/'
      },
      {
        href: '/manager/customers',
        label: 'Customers',
        icon: Users,
        active: path.includes('/manager/customers')
      },
      {
        href: '/manager/projects',
        label: 'Projects',
        icon: Briefcase,
        active: path.includes('/manager/projects')
      },
      {
        href: '/manager/pipeline',
        label: 'Pipeline',
        icon: PieChart,
        active: path.includes('/manager/pipeline')
      },
      {
        href: '/manager/mira-ai',
        label: 'Mira AI',
        icon: Zap,
        active: path.includes('/manager/mira-ai')
      },
      {
        href: '/manager/ki-personas',
        label: 'KI Personas',
        icon: PencilRuler,
        active: path.includes('/manager/ki-personas')
      },
      {
        href: '/manager/train-ai',
        label: 'Train AI',
        icon: Zap,
        active: path.includes('/manager/train-ai')
      },
      {
        href: '/manager/lead-database',
        label: 'Lead Database',
        icon: Database,
        active: path.includes('/manager/lead-database')
      },
      {
        href: '/manager/manager-kpi',
        label: 'Manager KPI',
        icon: LineChart,
        active: path.includes('/manager/manager-kpi')
      }
    ];
  }

  // Customer Navigation Items
  return [
    {
      href: '/customer/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: path === '/customer/dashboard' || path === '/customer/'
    },
    {
      href: '/customer/projects',
      label: 'Projects',
      icon: Briefcase,
      active: path.includes('/customer/projects')
    },
    {
      href: '/customer/pipeline',
      label: 'Pipeline',
      icon: PieChart,
      active: path.includes('/customer/pipeline')
    },
    {
      href: '/customer/lead-database',
      label: 'Lead Database',
      icon: Database,
      active: path.includes('/customer/lead-database')
    },
    {
      href: '/customer/search-strings',
      label: 'Search Strings',
      icon: FileText,
      active: path.includes('/customer/search-strings')
    },
    {
      href: '/customer/job-parsing',
      label: 'Jobangebote',
      icon: Briefcase,
      active: path.includes('/customer/job-parsing')
    },
    {
      href: '/customer/ki-personas',
      label: 'KI Personas',
      icon: PencilRuler,
      active: path.includes('/customer/ki-personas')
    },
    {
      href: '/customer/train-ai',
      label: 'Train AI',
      icon: Zap,
      active: path.includes('/customer/train-ai')
    },
    {
      href: '/customer/outreach',
      label: 'Outreach',
      icon: FileText,
      active: path.includes('/customer/outreach')
    },
    {
      href: '/customer/appointments',
      label: 'Appointments',
      icon: Calendar,
      active: path.includes('/customer/appointments')
    },
    {
      href: '/customer/integrations',
      label: 'Integrations',
      icon: Zap,
      active: path.includes('/customer/integrations')
    },
    {
      href: '/customer/appointments',
      label: 'Appointments',
      icon: Calendar,
      active: path.includes('/customer/appointments')
    }
  ];
};

export default SidebarNavItems;
