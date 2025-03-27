
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Bot,
  Megaphone
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { TranslationDict } from '../../utils/languageTypes';

export type NavItem = {
  name: string;
  path: string;
  icon: LucideIcon;
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
      { name: 'Customers', path: '/admin/customers', icon: Users },
      { name: t('projects'), path: '/admin/projects', icon: FolderKanban },
      { name: t('miraAI'), path: '/admin/mira-ai', icon: Bot },
      { name: t('outreach'), path: '/admin/outreach', icon: Megaphone },
      { name: t('settings'), path: '/admin/settings', icon: Settings },
    ],
    manager: [
      { name: t('dashboard'), path: '/manager/dashboard', icon: LayoutDashboard },
      { name: 'Customers', path: '/manager/customers', icon: Users },
      { name: t('projects'), path: '/manager/projects', icon: FolderKanban },
      { name: t('miraAI'), path: '/manager/mira-ai', icon: Bot },
      { name: t('outreach'), path: '/manager/outreach', icon: Megaphone },
      { name: t('settings'), path: '/manager/settings', icon: Settings },
    ],
    customer: [
      { name: t('dashboard'), path: '/customer/dashboard', icon: LayoutDashboard },
      { name: t('projects'), path: '/customer/projects', icon: FolderKanban },
      { name: t('appointments'), path: '/customer/appointments', icon: Calendar },
      { name: t('messages'), path: '/customer/messages', icon: MessageSquare },
      { name: t('miraAI'), path: '/customer/mira-ai', icon: Bot },
      { name: t('outreach'), path: '/customer/outreach', icon: Megaphone },
      { name: t('settings'), path: '/customer/settings', icon: Settings },
    ]
  };
};
