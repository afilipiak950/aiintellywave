import {
  Building,
  CalendarDays,
  ChevronDown,
  Home,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  ScatterChart,
  Settings,
  Terminal,
  Tool,
  Upload,
  UserCircle,
  Users,
  Folder,
  ClipboardCheck,
  SendHorizonal,
} from 'lucide-react';

export const AdminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    section: 'admin',
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: <Users className="h-4 w-4" />,
    section: 'admin',
  },
  {
    title: 'Companies & Customers',
    href: '/admin/companies-customers',
    icon: <Building className="h-4 w-4" />,
    section: 'admin',
  },
  {
    title: 'Projects',
    href: '/admin/projects',
    icon: <Folder className="h-4 w-4" />,
    section: 'admin',
  },
  {
    title: 'KI Personas',
    href: '/admin/personas',
    icon: <UserCircle className="h-4 w-4" />,
    section: 'admin',
  },
  {
    title: 'Pipeline',
    href: '/admin/pipeline',
    icon: <ClipboardCheck className="h-4 w-4" />,
    section: 'admin',
  },
  {
    title: 'Mira AI',
    href: '/admin/mira-ai',
    icon: <MessageSquare className="h-4 w-4" />,
    section: 'admin',
  },
  {
    title: 'Settings',
    href: '/admin/settings/profile',
    icon: <Settings className="h-4 w-4" />,
    section: 'admin',
  },
];

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
      { name: t('CUSTOMERS') || 'CUSTOMERS', path: '/admin/customers', icon: Users },
      { name: t('projects'), path: '/admin/projects', icon: FolderKanban },
      { name: 'TRAIN AI', path: '/admin/train-ai', icon: Brain },
      { name: t('settings'), path: '/admin/settings', icon: Settings },
    ],
    manager: [
      { name: t('dashboard'), path: '/manager/dashboard', icon: LayoutDashboard },
      { name: t('CUSTOMERS') || 'CUSTOMERS', path: '/manager/customers', icon: Users },
      { name: t('projects'), path: '/manager/projects', icon: FolderKanban },
      { name: t('PIPELINE') || 'PIPELINE', path: '/manager/pipeline', icon: GitBranch },
      { name: t('LEADS') || 'LEADS', path: '/manager/leads', icon: UserPlus },
      { name: t('miraAI'), path: '/manager/mira-ai', icon: Bot },
      { name: 'KI PERSONAS', path: '/manager/ki-personas', icon: UserCircle },
      { name: 'TRAIN AI', path: '/manager/train-ai', icon: Brain },
      { name: t('outreach'), path: '/manager/outreach', icon: ExternalLink, badge: { text: 'SOON', variant: 'default' } },
      { name: t('settings'), path: '/manager/settings', icon: Settings },
    ],
    customer: [
      { name: t('dashboard'), path: '/customer/dashboard', icon: LayoutDashboard },
      { name: t('projects'), path: '/customer/projects', icon: FolderKanban },
      { name: t('PIPELINE') || 'PIPELINE', path: '/customer/pipeline', icon: GitBranch },
      { name: t('LEADS') || 'LEADS', path: '/customer/leads', icon: UserPlus },
      { name: t('appointments'), path: '/customer/appointments', icon: Calendar },
      { name: t('miraAI'), path: '/customer/mira-ai', icon: Bot },
      { name: 'KI PERSONAS', path: '/customer/ki-personas', icon: UserCircle },
      { name: 'TRAIN AI', path: '/customer/train-ai', icon: Brain },
      { name: t('STATISTICS') || 'STATISTICS', path: '/customer/statistics', icon: BarChart3, badge: { text: 'SOON', variant: 'default' } },
      { name: t('outreach'), path: '/customer/outreach', icon: ExternalLink, badge: { text: 'SOON', variant: 'default' } },
      { name: t('settings'), path: '/customer/settings', icon: Settings },
    ]
  };
};
