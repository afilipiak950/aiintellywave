
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Calendar, 
  Settings, 
  Bot,
  Megaphone,
  GitBranch,
  UserPlus,
  BarChart3,
  ExternalLink
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
      { name: t('PIPELINE') || 'Pipeline', path: '/admin/pipeline', icon: GitBranch },
      { name: t('LEADS') || 'Leads', path: '/admin/leads', icon: UserPlus, badge: { text: 'New', variant: 'default' } },
      { name: t('miraAI'), path: '/admin/mira-ai', icon: Bot, badge: { text: 'Beta', variant: 'secondary' } },
      { name: t('outreach'), path: '/admin/outreach', icon: Megaphone, badge: { text: 'Soon', variant: 'outline' } },
      { name: t('settings'), path: '/admin/settings', icon: Settings },
    ],
    manager: [
      { name: t('dashboard'), path: '/manager/dashboard', icon: LayoutDashboard },
      { name: t('CUSTOMERS') || 'Customers', path: '/manager/customers', icon: Users },
      { name: t('projects'), path: '/manager/projects', icon: FolderKanban },
      { name: t('PIPELINE') || 'Pipeline', path: '/manager/pipeline', icon: GitBranch },
      { name: t('LEADS') || 'Leads', path: '/manager/leads', icon: UserPlus, badge: { text: 'New', variant: 'default' } },
      { name: t('miraAI'), path: '/manager/mira-ai', icon: Bot, badge: { text: 'Beta', variant: 'secondary' } },
      { name: t('outreach'), path: '/manager/outreach', icon: Megaphone, badge: { text: 'Soon', variant: 'outline' } },
      { name: t('settings'), path: '/manager/settings', icon: Settings },
    ],
    customer: [
      { name: t('dashboard'), path: '/customer/dashboard', icon: LayoutDashboard },
      { name: t('projects'), path: '/customer/projects', icon: FolderKanban },
      { name: t('PIPELINE') || 'Pipeline', path: '/customer/pipeline', icon: GitBranch },
      { name: t('LEADS') || 'Leads', path: '/customer/leads', icon: UserPlus, badge: { text: 'New', variant: 'default' } },
      { name: t('appointments'), path: '/customer/appointments', icon: Calendar },
      { name: t('miraAI'), path: '/customer/mira-ai', icon: Bot, badge: { text: 'Beta', variant: 'secondary' } },
      { name: t('STATISTICS') || 'Statistics', path: '/customer/statistics', icon: BarChart3, badge: { text: 'Soon', variant: 'outline' } },
      { name: t('outreach'), path: '/customer/outreach', icon: ExternalLink, badge: { text: 'Soon', variant: 'outline' } },
      { name: t('settings'), path: '/customer/settings', icon: Settings },
    ]
  };
};
