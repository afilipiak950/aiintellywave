
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
  Link,
} from "lucide-react";
import { NavItem } from "./types";

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
