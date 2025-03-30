
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
  Brain,
  LinkIcon
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
      { name: t('dashboard').toUpperCase(), path: '/admin/dashboard', icon: LayoutDashboard },
      { name: (t('CUSTOMERS') || 'CUSTOMERS').toUpperCase(), path: '/admin/customers', icon: Users },
      { name: t('projects').toUpperCase(), path: '/admin/projects', icon: FolderKanban },
      { name: 'TRAIN AI', path: '/admin/train-ai', icon: Brain },
      { name: t('settings').toUpperCase(), path: '/admin/settings', icon: Settings },
    ],
    manager: [
      { name: t('dashboard').toUpperCase(), path: '/manager/dashboard', icon: LayoutDashboard },
      { name: (t('CUSTOMERS') || 'CUSTOMERS').toUpperCase(), path: '/manager/customers', icon: Users },
      { name: t('projects').toUpperCase(), path: '/manager/projects', icon: FolderKanban },
      { name: (t('PIPELINE') || 'PIPELINE').toUpperCase(), path: '/manager/pipeline', icon: GitBranch },
      { name: (t('LEADS') || 'LEADS').toUpperCase(), path: '/manager/leads', icon: UserPlus },
      { name: t('miraAI').toUpperCase(), path: '/manager/mira-ai', icon: Bot },
      { name: 'KI PERSONAS', path: '/manager/ki-personas', icon: UserCircle },
      { name: 'TRAIN AI', path: '/manager/train-ai', icon: Brain },
      { name: t('outreach').toUpperCase(), path: '/manager/outreach', icon: ExternalLink, badge: { text: 'Soon', variant: 'default' } },
      { name: t('settings').toUpperCase(), path: '/manager/settings', icon: Settings },
    ],
    customer: [
      { name: t('dashboard').toUpperCase(), path: '/customer/dashboard', icon: LayoutDashboard },
      { name: t('projects').toUpperCase(), path: '/customer/projects', icon: FolderKanban },
      { name: (t('PIPELINE') || 'PIPELINE').toUpperCase(), path: '/customer/pipeline', icon: GitBranch },
      { name: (t('LEADS') || 'LEADS').toUpperCase(), path: '/customer/leads', icon: UserPlus },
      { name: t('appointments').toUpperCase(), path: '/customer/appointments', icon: Calendar },
      { name: t('miraAI').toUpperCase(), path: '/customer/mira-ai', icon: Bot },
      { name: 'KI PERSONAS', path: '/customer/ki-personas', icon: UserCircle },
      { name: 'TRAIN AI', path: '/customer/train-ai', icon: Brain },
      { name: (t('STATISTICS') || 'STATISTICS').toUpperCase(), path: '/customer/statistics', icon: BarChart3, badge: { text: 'Soon', variant: 'default' } },
      { name: t('outreach').toUpperCase(), path: '/customer/outreach', icon: ExternalLink, badge: { text: 'Soon', variant: 'default' } },
      { name: t('settings').toUpperCase(), path: '/customer/settings', icon: Settings },
      { name: 'INTEGRATIONS', path: '/customer/integrations', icon: LinkIcon },
    ]
  };
};
