
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
  BriefcaseBusiness,
  MessageSquare
} from "lucide-react";
import { NavItem } from "./types";

export const BASE_CUSTOMER_NAV_ITEMS: NavItem[] = [
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
    name: "Jobangebote",
    href: "/customer/job-parsing",
    icon: BriefcaseBusiness,
    badge: {
      text: "New",
      variant: "default"
    }
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
    name: "Outreach",
    href: "/customer/outreach",
    icon: MessageSquare,
  },
  {
    name: "Integrations",
    href: "/customer/integrations",
    icon: Link,
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
    name: "Settings",
    href: "/customer/settings/profile",
    icon: Settings,
  },
];

// No longer needed since we added Jobangebote directly to BASE_CUSTOMER_NAV_ITEMS
export const JOB_PARSING_NAV_ITEM: NavItem = {
  name: "Jobangebote",
  href: "/customer/job-parsing",
  icon: BriefcaseBusiness,
  badge: {
    text: "New",
    variant: "default"
  }
};
