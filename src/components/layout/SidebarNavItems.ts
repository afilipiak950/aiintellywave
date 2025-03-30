
import {
  LayoutDashboard,
  Database,
  Users,
  LineChart,
  Settings,
  Calendar,
  MessageSquare,
  MailCheck,
  GitPullRequest,
  BrainCircuit,
  Send,
  UserCircle,
  Building,
  CircuitBoard,
  Link,
} from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  };
}

export interface NavItems {
  admin: NavItem[];
  manager: NavItem[];
  customer: NavItem[];
}

export const createNavItems = (translationDict: any): NavItems => {
  const t = (key: string) => translationDict[key] || key;

  return {
    admin: [
      {
        name: t('dashboard'),
        path: '/admin/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: t('customers'),
        path: '/admin/customers',
        icon: Users,
        badge: {
          text: t('new'),
          variant: 'default',
        },
      },
      {
        name: t('projects'),
        path: '/admin/projects',
        icon: GitPullRequest,
      },
      {
        name: t('pipeline'),
        path: '/admin/pipeline',
        icon: GitPullRequest,
      },
      {
        name: t('miraAI'),
        path: '/admin/mira-ai',
        icon: BrainCircuit,
      },
      {
        name: t('kiPersonas'),
        path: '/admin/personas',
        icon: UserCircle,
      },
      {
        name: t('settings'),
        path: '/admin/settings',
        icon: Settings,
      },
    ],
    
    manager: [
      {
        name: t('dashboard'),
        path: '/manager/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: t('customers'),
        path: '/manager/customers',
        icon: Users,
      },
      {
        name: t('projects'),
        path: '/manager/projects',
        icon: GitPullRequest,
      },
      {
        name: t('pipeline'),
        path: '/manager/pipeline',
        icon: LineChart,
      },
      {
        name: t('leadDatabase'),
        path: '/manager/lead-database',
        icon: Database,
      },
      {
        name: t('miraAI'),
        path: '/manager/mira-ai',
        icon: BrainCircuit,
      },
      {
        name: t('kiPersonas'),
        path: '/manager/personas',
        icon: UserCircle,
      },
    ],
    
    customer: [
      {
        name: t('dashboard'),
        path: '/customer/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: t('projects'),
        path: '/customer/projects',
        icon: Building,
      },
      {
        name: t('pipeline'),
        path: '/customer/pipeline',
        icon: LineChart,
      },
      {
        name: t('leadDatabase'),
        path: '/customer/lead-database',
        icon: Database,
      },
      {
        name: t('miraAI'),
        path: '/customer/mira-ai',
        icon: BrainCircuit,
      },
      {
        name: t('outreach'),
        path: '/customer/outreach',
        icon: Send,
      },
      {
        name: t('appointments'),
        path: '/customer/appointments',
        icon: Calendar,
      },
      {
        name: t('statistics'),
        path: '/customer/statistics',
        icon: LineChart,
      },
      {
        name: t('integrations'),
        path: '/customer/integrations',
        icon: Link,
      },
      {
        name: t('profile'),
        path: '/customer/profile',
        icon: UserCircle,
      },
    ],
  };
};
