
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
    name: "Instantly nsite",
    href: "/admin/instantly",
    icon: Globe,
  },
  {
    name: "Project Site",
    href: "/admin/projects",
    icon: Folder,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];
