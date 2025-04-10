
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
    name: "Instantly",
    href: "/admin/instantly",
    icon: Mailbox,
  },
  {
    name: "Revenue",
    href: "/admin/revenue",
    icon: TrendingUp,
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
    name: "Billing",
    href: "/customer/billing",
    icon: CreditCard,
  },
  {
    name: "Support",
    href: "/customer/support",
    icon: HelpCircle,
  },
];
