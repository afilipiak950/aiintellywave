
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
  const t = (key: string) => translationDict[key]?.toUpperCase() || key.toUpperCase();

  return {
    admin: [
      {
        name: t('DASHBOARD'),
        path: '/admin/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: t('CUSTOMERS'),
        path: '/admin/customers',
        icon: Users,
        badge: {
          text: t('NEW'),
          variant: 'default',
        },
      },
      {
        name: t('PROJECTS'),
        path: '/admin/projects',
        icon: GitPullRequest,
      },
      {
        name: t('PIPELINE'),
        path: '/admin/pipeline',
        icon: GitPullRequest,
      },
      {
        name: t('MIRA_AI'),
        path: '/admin/mira-ai',
        icon: BrainCircuit,
      },
      {
        name: t('KI_PERSONAS'),
        path: '/admin/personas',
        icon: UserCircle,
      },
      {
        name: t('SETTINGS'),
        path: '/admin/settings',
        icon: Settings,
      },
    ],
    
    manager: [
      {
        name: t('DASHBOARD'),
        path: '/manager/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: t('CUSTOMERS'),
        path: '/manager/customers',
        icon: Users,
      },
      {
        name: t('PROJECTS'),
        path: '/manager/projects',
        icon: GitPullRequest,
      },
      {
        name: t('PIPELINE'),
        path: '/manager/pipeline',
        icon: LineChart,
      },
      {
        name: t('LEAD_DATABASE'),
        path: '/manager/lead-database',
        icon: Database,
      },
      {
        name: t('MIRA_AI'),
        path: '/manager/mira-ai',
        icon: BrainCircuit,
      },
      {
        name: t('KI_PERSONAS'),
        path: '/manager/personas',
        icon: UserCircle,
      },
    ],
    
    customer: [
      {
        name: t('DASHBOARD'),
        path: '/customer/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: t('PROJECTS'),
        path: '/customer/projects',
        icon: Building,
      },
      {
        name: t('PIPELINE'),
        path: '/customer/pipeline',
        icon: LineChart,
      },
      {
        name: t('LEAD_DATABASE'),
        path: '/customer/lead-database',
        icon: Database,
      },
      {
        name: t('MIRA_AI'),
        path: '/customer/mira-ai',
        icon: BrainCircuit,
      },
      {
        name: t('OUTREACH'),
        path: '/customer/outreach',
        icon: Send,
        badge: { text: 'SOON', variant: 'default' }
      },
      {
        name: t('APPOINTMENTS'),
        path: '/customer/appointments',
        icon: Calendar,
      },
      {
        name: t('STATISTICS'),
        path: '/customer/statistics',
        icon: LineChart,
        badge: { text: 'SOON', variant: 'default' }
      },
      {
        name: t('INTEGRATIONS'),
        path: '/customer/integrations',
        icon: Link,
      },
      {
        name: t('PROFILE'),
        path: '/customer/profile',
        icon: UserCircle,
      },
    ],
  };
};
