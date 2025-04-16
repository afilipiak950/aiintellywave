import {
  LayoutDashboard,
  Settings,
  User2,
  Globe,
  Folder,
  TrendingUp,
  Mailbox,
  Users,
  Wallet,
  Search,
  Building2,
  Activity,
  Contact2,
  LineChart,
  FolderKanban,
} from "lucide-react";
import { NavItem } from "./types";

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Revenue",
    href: "/admin/revenue",
    icon: Wallet,
  },
  {
    name: "Search Strings",
    href: "/admin/search-strings",
    icon: Search,
  },
  {
    name: "Instantly Campaigns",
    href: "/admin/instantly",
    icon: Globe,
  },
  {
    name: "Project Campaigns",
    href: "/admin/projects",
    icon: Folder,
  },
  {
    name: "Settings",
    href: "/admin/settings",
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
    icon: Building2,
  },
  {
    name: "Teams",
    href: "/manager/teams",
    icon: Users,
  },
  {
    name: "Projects",
    href: "/manager/projects",
    icon: FolderKanban,
  },
  {
    name: "Leads",
    href: "/manager/leads",
    icon: Contact2,
  },
  {
    name: "Reports",
    href: "/manager/reports",
    icon: Activity,
  },
  {
    name: "KPI Dashboard",
    href: "/manager/manager-kpi",
    icon: LineChart,
  },
  {
    name: "Settings",
    href: "/manager/settings",
    icon: Settings,
  },
];

export const MANAGER_KPI_ITEM: NavItem = {
  name: "KPI Dashboard",
  href: "/customer/manager-kpi",
  icon: LineChart,
};
