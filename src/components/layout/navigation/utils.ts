
import { Icons } from '@/components/layout/navigation/types';
import {
  Home,
  Users,
  FileText,
  Calendar,
  Settings,
  ShoppingCart,
  Briefcase,
  BookOpen,
  Mail,
  PieChart,
  User,
  Lock,
  LineChart,
  Search,
  MessageSquare,
  Layers,
  Mail as MailIcon,
} from 'lucide-react';

export const adminLinks = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'Projects',
    href: '/admin/projects',
    icon: FileText,
  },
  {
    title: 'Workflows',
    href: '/admin/workflows',
    icon: MailIcon,
  },
];

export const managerLinks = [
  {
    title: 'Dashboard',
    href: '/manager/dashboard',
    icon: Home,
  },
  {
    title: 'Customers',
    href: '/manager/customers',
    icon: Users,
  },
  {
    title: 'Projects',
    href: '/manager/projects',
    icon: FileText,
  },
];

export const customerLinks = [
  {
    title: 'Dashboard',
    href: '/customer/dashboard',
    icon: Home,
  },
  {
    title: 'Projects',
    href: '/customer/projects',
    icon: Briefcase,
  },
  {
    title: 'Leads',
    href: '/customer/leads',
    icon: Search,
  },
  {
    title: 'Appointments',
    href: '/customer/appointments',
    icon: Calendar,
  },
  {
    title: 'Email Campaigns',
    href: '/customer/workflows',
    icon: MailIcon,
  },
  {
    title: 'Integrations',
    href: '/customer/integrations',
    icon: Layers,
  },
];

export const settingsLinks = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Lock,
  },
];

export const featuredLinks = {
  admin: [
    {
      title: 'KPI Dashboard',
      href: '/admin/dashboard',
      icon: 'PieChart',
      color: 'text-blue-500',
      description: 'View key performance indicators',
    },
    {
      title: 'Customer Management',
      href: '/admin/customers',
      icon: 'Users',
      color: 'text-green-500',
      description: 'Manage customer accounts',
    },
    {
      title: 'Revenue Analytics',
      href: '/admin/revenue',
      icon: 'LineChart',
      color: 'text-purple-500',
      description: 'Track financial performance',
    },
  ],
  customer: [
    {
      title: 'Lead Management',
      href: '/customer/leads',
      icon: 'Search',
      color: 'text-blue-500',
      description: 'Find and manage leads',
    },
    {
      title: 'Book Appointment',
      href: '/customer/appointments',
      icon: 'Calendar',
      color: 'text-green-500',
      description: 'Schedule meetings',
    },
    {
      title: 'Email Campaigns',
      href: '/customer/workflows',
      icon: 'Mail',
      color: 'text-purple-500',
      description: 'View your email campaigns',
    },
  ],
  manager: [
    {
      title: 'Team Performance',
      href: '/manager/dashboard',
      icon: 'LineChart',
      color: 'text-blue-500',
      description: 'Monitor team KPIs',
    },
    {
      title: 'Customer Accounts',
      href: '/manager/customers',
      icon: 'Users',
      color: 'text-green-500',
      description: 'Manage customer relationships',
    },
    {
      title: 'Project Tracking',
      href: '/manager/projects',
      icon: 'FileText',
      color: 'text-purple-500',
      description: 'Track project progress',
    },
  ],
};

// This maps the string icon names in featuredLinks to the actual Lucide components
export const iconMap: Icons = {
  Home,
  Users,
  FileText,
  Calendar,
  Settings,
  ShoppingCart,
  Briefcase,
  BookOpen,
  Mail,
  PieChart,
  LineChart,
  Search,
  MessageSquare,
  Layers,
};
