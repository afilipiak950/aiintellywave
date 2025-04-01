
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
  DollarSign
} from 'lucide-react';

export const createNavItems = (translations: any = {}) => {
  const t = (key: string) => translations[key] || key;

  return {
    admin: [
      {
        title: t("Dashboard"),
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: t("Revenue"),
        href: "/admin/revenue",
        icon: DollarSign,
      },
      {
        title: t("Customers"),
        href: "/admin/customers",
        icon: Users,
      },
      {
        title: t("Companies & Customers"),
        href: "/admin/companies-customers",
        icon: Building2,
      },
      {
        title: t("Projects"),
        href: "/admin/projects",
        icon: FolderKanban,
      },
      {
        title: t("Settings"),
        href: "/admin/settings/profile",
        icon: Settings,
      },
    ],
    manager: [
      {
        title: t("Dashboard"),
        href: "/manager/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: t("Customers"),
        href: "/manager/customers",
        icon: Users,
      },
      {
        title: t("Projects"),
        href: "/manager/projects",
        icon: FolderKanban,
      },
      {
        title: t("Lead Database"),
        href: "/manager/leads",
        icon: Database,
      },
      {
        title: t("Personas"),
        href: "/manager/personas",
        icon: User,
      },
      {
        title: t("AI Search"),
        href: "/manager/search",
        icon: Search,
      },
      {
        title: t("Appointments"),
        href: "/manager/appointments",
        icon: MailCheck,
      },
      {
        title: t("Pipeline"),
        href: "/manager/pipeline",
        icon: PanelRight,
      },
      {
        title: t("Reports"),
        href: "/manager/reports",
        icon: BarChart3,
      },
      {
        title: t("Settings"),
        href: "/manager/settings/profile",
        icon: Settings,
      },
    ],
    customer: [
      {
        title: t("Dashboard"),
        href: "/customer/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: t("Projects"),
        href: "/customer/projects",
        icon: FolderKanban,
      },
      {
        title: t("Lead Database"),
        href: "/customer/leads",
        icon: Database,
      },
      {
        title: t("Outreach AI"),
        href: "/customer/outreach",
        icon: MessageSquare,
      },
      {
        title: t("Performance"),
        href: "/customer/performance",
        icon: TrendingUp,
      },
      {
        title: t("Settings"),
        href: "/customer/settings/profile",
        icon: Settings,
      },
    ],
  };
};

export default createNavItems;
