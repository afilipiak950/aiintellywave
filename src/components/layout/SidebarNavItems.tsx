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
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    alert: false,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
    alert: false,
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
    alert: false,
  },
  {
    name: "Workflows",
    href: "/admin/workflows",
    icon: Activity,
    alert: false,
  },
  {
    name: "Instantly",
    href: "/admin/instantly",
    icon: Mailbox,
    alert: false,
  },
  {
    name: "Revenue",
    href: "/admin/revenue",
    icon: TrendingUp,
    alert: false
  },
];

export const MANAGER_NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/manager/dashboard",
    icon: LayoutDashboard,
    alert: false,
  },
  {
    name: "Customers",
    href: "/manager/customers",
    icon: Users,
    alert: false,
  },
  {
    name: "Projects",
    href: "/manager/projects",
    icon: FolderKanban,
    alert: false,
  },
  {
    name: "Workflows",
    href: "/manager/workflows",
    icon: Activity,
    alert: false,
  },
  {
    name: "Revenue",
    href: "/manager/revenue",
    icon: TrendingUp,
    alert: false
  },
];

export const CUSTOMER_NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/customer/dashboard",
    icon: LayoutDashboard,
    alert: false,
  },
  {
    name: "Projects",
    href: "/customer/projects",
    icon: FolderKanban,
    alert: false,
  },
  {
    name: "Billing",
    href: "/customer/billing",
    icon: CreditCard,
    alert: false,
  },
  {
    name: "Support",
    href: "/customer/support",
    icon: HelpCircle,
    alert: false,
  },
];
