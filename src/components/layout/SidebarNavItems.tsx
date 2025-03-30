
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Settings,
  Calendar, 
  Bot,
  GitBranch,
  UserPlus,
  BarChart3,
  ExternalLink,
  UserCircle,
  Brain
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { TranslationDict } from '../../utils/languageTypes';

export type NavItem = {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
};

export type NavItems = {
  admin: NavItem[];
  manager: NavItem[];
  customer: NavItem[];
};

export const createNavItems = (t: (key: keyof TranslationDict) => string): NavItems => {
  return {
    admin: [
      { name: t('dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
      { name: t('CUSTOMERS') || 'Customers', path: '/admin/customers', icon: Users },
      { name: t('projects'), path: '/admin/projects', icon: FolderKanban },
      { name: 'Train AI', path: '/admin/train-ai', icon: Brain },
      { name: t('settings'), path: '/admin/settings', icon: Settings },
    ],
    manager: [
      { name: t('dashboard'), path: '/manager/dashboard', icon: LayoutDashboard },
      { name: t('CUSTOMERS') || 'Customers', path: '/manager/customers', icon: Users },
      { name: t('projects'), path: '/manager/projects', icon: FolderKanban },
      { name: t('PIPELINE') || 'Pipeline', path: '/manager/pipeline', icon: GitBranch },
      { name: t('LEADS') || 'Leads', path: '/manager/leads', icon: UserPlus },
      { name: t('miraAI'), path: '/manager/mira-ai', icon: Bot },
      { name: 'KI Personas', path: '/manager/ki-personas', icon: UserCircle },
      { name: 'Train AI', path: '/manager/train-ai', icon: Brain },
      { name: t('outreach'), path: '/manager/outreach', icon: ExternalLink, badge: { text: 'Soon', variant: 'default' } },
      { name: t('settings'), path: '/manager/settings', icon: Settings },
    ],
    customer: [
      { name: t('dashboard'), path: '/customer/dashboard', icon: LayoutDashboard },
      { name: t('projects'), path: '/customer/projects', icon: FolderKanban },
      { name: t('PIPELINE') || 'Pipeline', path: '/customer/pipeline', icon: GitBranch },
      { name: t('LEADS') || 'Leads', path: '/customer/leads', icon: UserPlus },
      { name: t('appointments'), path: '/customer/appointments', icon: Calendar },
      { name: t('miraAI'), path: '/customer/mira-ai', icon: Bot },
      { name: 'KI Personas', path: '/customer/ki-personas', icon: UserCircle },
      { name: 'Train AI', path: '/customer/train-ai', icon: Brain },
      { name: t('STATISTICS') || 'Statistics', path: '/customer/statistics', icon: BarChart3, badge: { text: 'Soon', variant: 'default' } },
      { name: t('outreach'), path: '/customer/outreach', icon: ExternalLink, badge: { text: 'Soon', variant: 'default' } },
      { name: t('settings'), path: '/customer/settings', icon: Settings },
    ]
  };
};
