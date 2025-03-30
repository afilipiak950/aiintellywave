
import { TranslationDict } from '../../utils/languageTypes';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban,
  Calendar, 
  UserPlus,
  Bot,
  BarChart3,
  ExternalLink,
  Settings,
  UserCircle,
  GitBranch,
  Brain
} from 'lucide-react';

export interface NavItem {
  name: string;
  icon: any;
  path: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
}

export interface NavItems {
  admin: NavItem[];
  manager: NavItem[];
  customer: NavItem[];
}

export const createNavItems = (t: TranslationDict): NavItems => {
  return {
    admin: [
      {
        name: t.DASHBOARD || t.dashboard,
        icon: LayoutDashboard,
        path: '/admin'
      },
      {
        name: t.CUSTOMERS || 'Customers',
        icon: Users,
        path: '/admin/customers'
      },
      {
        name: t.PROJECTS || t.projects,
        icon: FolderKanban,
        path: '/admin/projects'
      },
      {
        name: 'Train AI',
        icon: Brain,
        path: '/admin/train-ai'
      },
      {
        name: t.SETTINGS || t.settings,
        icon: Settings,
        path: '/admin/settings/profile'
      }
    ],
    manager: [
      {
        name: t.DASHBOARD || t.dashboard,
        icon: LayoutDashboard,
        path: '/manager'
      },
      {
        name: t.CUSTOMERS || 'Customers',
        icon: Users,
        path: '/manager/customers'
      },
      {
        name: t.PROJECTS || t.projects,
        icon: FolderKanban,
        path: '/manager/projects'
      },
      {
        name: t.PIPELINE || 'Pipeline',
        icon: GitBranch,
        path: '/manager/pipeline'
      },
      {
        name: t.LEADS || 'Leads',
        icon: UserPlus,
        path: '/manager/leads'
      },
      {
        name: 'Mira AI',
        icon: Bot,
        path: '/manager/ai'
      },
      {
        name: 'KI Personas',
        icon: UserCircle,
        path: '/manager/ki-personas'
      },
      {
        name: 'Train AI',
        icon: Brain,
        path: '/manager/train-ai'
      },
      {
        name: 'Outreach',
        icon: ExternalLink,
        path: '/manager/outreach',
        badge: { text: 'Soon', variant: 'default' }
      },
      {
        name: t.SETTINGS || t.settings,
        icon: Settings,
        path: '/manager/settings/profile'
      }
    ],
    customer: [
      {
        name: t.DASHBOARD || t.dashboard,
        icon: LayoutDashboard,
        path: '/customer'
      },
      {
        name: t.PROJECTS || t.projects,
        icon: FolderKanban,
        path: '/customer/projects'
      },
      {
        name: t.PIPELINE || 'Pipeline',
        icon: GitBranch,
        path: '/customer/pipeline'
      },
      {
        name: t.LEADS || 'Leads',
        icon: UserPlus,
        path: '/customer/leads'
      },
      {
        name: t.APPOINTMENTS || t.appointments,
        icon: Calendar,
        path: '/customer/appointments'
      },
      {
        name: 'Mira AI',
        icon: Bot,
        path: '/customer/ai'
      },
      {
        name: 'KI Personas',
        icon: UserCircle,
        path: '/customer/ki-personas'
      },
      {
        name: 'Train AI',
        icon: Brain,
        path: '/customer/train-ai'
      },
      {
        name: t.STATISTICS || 'Statistics',
        icon: BarChart3,
        path: '/customer/statistics',
        badge: { text: 'Soon', variant: 'default' }
      },
      {
        name: 'Outreach',
        icon: ExternalLink,
        path: '/customer/outreach',
        badge: { text: 'Soon', variant: 'default' }
      },
      {
        name: t.SETTINGS || t.settings,
        icon: Settings,
        path: '/customer/settings/profile'
      }
    ]
  };
};
