
import {
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Settings, 
  User, 
  Building2, 
  Search,
  Database,
  MessageSquare,
  MailCheck,
  PanelRight,
  BarChart3,
  TrendingUp,
  DollarSign,
  LucideIcon
} from 'lucide-react';

// Export the NavItem interface
export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
}

export type NavItems = {
  admin: NavItem[];
  manager: NavItem[];
  customer: NavItem[];
}

export const createNavItems = (translations: any = {}) => {
  const t = (key: string) => translations[key] || key;

  return {
    admin: [
      {
        name: t("Dashboard"),
        path: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: t("Revenue"),
        path: "/admin/revenue",
        icon: DollarSign,
      },
      {
        name: t("Customers"),
        path: "/admin/customers",
        icon: Users,
      },
      {
        name: t("Companies & Customers"),
        path: "/admin/companies-customers",
        icon: Building2,
      },
      {
        name: t("Projects"),
        path: "/admin/projects",
        icon: FolderKanban,
      },
      {
        name: t("Settings"),
        path: "/admin/settings/profile",
        icon: Settings,
      },
    ],
    manager: [
      {
        name: t("Dashboard"),
        path: "/manager/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: t("Customers"),
        path: "/manager/customers",
        icon: Users,
      },
      {
        name: t("Projects"),
        path: "/manager/projects",
        icon: FolderKanban,
      },
      {
        name: t("Lead Database"),
        path: "/manager/leads",
        icon: Database,
      },
      {
        name: t("Personas"),
        path: "/manager/personas",
        icon: User,
      },
      {
        name: t("AI Search"),
        path: "/manager/search",
        icon: Search,
      },
      {
        name: t("Appointments"),
        path: "/manager/appointments",
        icon: MailCheck,
      },
      {
        name: t("Pipeline"),
        path: "/manager/pipeline",
        icon: PanelRight,
      },
      {
        name: t("Reports"),
        path: "/manager/reports",
        icon: BarChart3,
      },
      {
        name: t("Settings"),
        path: "/manager/settings/profile",
        icon: Settings,
      },
    ],
    customer: [
      {
        name: t("Dashboard"),
        path: "/customer/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: t("Projects"),
        path: "/customer/projects",
        icon: FolderKanban,
      },
      {
        name: t("Lead Database"),
        path: "/customer/leads",
        icon: Database,
      },
      {
        name: t("Outreach AI"),
        path: "/customer/outreach",
        icon: MessageSquare,
      },
      {
        name: t("Performance"),
        path: "/customer/performance",
        icon: TrendingUp,
      },
      {
        name: t("Settings"),
        path: "/customer/settings/profile",
        icon: Settings,
      },
    ],
  };
};

export default createNavItems;
