
import {
  LayoutDashboard,
  Settings,
  User2,
  FolderKanban,
  TrendingUp,
  Mailbox,
  Building2,
  Users,
  Wallet,
  Activity,
  CreditCard,
  HelpCircle,
  Contact2,
  Search,
  LucideIcon
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  path?: string;
  active?: boolean;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    name: "Workflows",
    href: "/admin/workflows",
    icon: Activity,
  },
  {
    name: "Search Strings",
    href: "/admin/search-strings",
    icon: Search,
  },
  {
    name: "Instantly",
    href: "/admin/instantly",
    icon: Mailbox,
  },
  {
    name: "Revenue",
    href: "/admin/revenue",
    icon: TrendingUp,
  },
  {
    name: "Settings",
    href: "/admin/settings/profile",
    icon: Settings,
  },
];

export const MANAGER_NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/manager/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    href: "/manager/customers",
    icon: Users,
  },
  {
    name: "Projects",
    href: "/manager/projects",
    icon: FolderKanban,
  },
  {
    name: "Workflows",
    href: "/manager/workflows",
    icon: Activity,
  },
  {
    name: "Revenue",
    href: "/manager/revenue",
    icon: TrendingUp,
  },
  {
    name: "Settings",
    href: "/manager/settings/profile",
    icon: Settings,
  },
];

export const CUSTOMER_NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/customer/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/customer/projects",
    icon: FolderKanban,
  },
  {
    name: "Search Strings",
    href: "/customer/search-strings",
    icon: Search,
  },
  {
    name: "Pipeline",
    href: "/customer/pipeline",
    icon: Activity,
  },
  {
    name: "Lead Database",
    href: "/customer/lead-database",
    icon: Building2,
  },
  {
    name: "MIRA AI",
    href: "/customer/mira-ai",
    icon: Mailbox,
  },
  {
    name: "KI Personas",
    href: "/customer/ki-personas",
    icon: User2,
  },
  {
    name: "Train AI",
    href: "/customer/train-ai",
    icon: Activity,
  },
  {
    name: "Statistics",
    href: "/customer/statistics",
    icon: TrendingUp,
    badge: {
      text: "Soon",
      variant: "default"
    }
  },
  {
    name: "Billing",
    href: "/customer/billing",
    icon: CreditCard,
  },
  {
    name: "Support",
    href: "/customer/support",
    icon: HelpCircle,
  },
  {
    name: "Settings",
    href: "/customer/settings/profile",
    icon: Settings,
  },
];
