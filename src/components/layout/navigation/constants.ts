
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
  Search
} from "lucide-react";
import { NavItemsByRole } from "./types";

// Define Manager KPI item for use in dynamic navigation
export const MANAGER_KPI_ITEM = {
  name: "Manager KPI",
  href: "/customer/manager-kpi",
  path: "/customer/manager-kpi",
  icon: LayoutDashboard
};

export const NAV_ITEMS: NavItemsByRole = {
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/admin/projects", icon: FolderKanban },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Revenue", href: "/admin/revenue", icon: TrendingUp },
    { name: "Workflows", href: "/admin/workflows", icon: Activity },
    { name: "Search Strings", href: "/admin/search-strings", icon: Search },
    { name: "Instantly", href: "/admin/instantly", icon: Mailbox },
    { name: "Settings", href: "/admin/settings/profile", icon: Settings }
  ],
  manager: [
    { name: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/manager/projects", icon: FolderKanban },
    { name: "Customers", href: "/manager/customers", icon: Users },
    { name: "Pipeline", href: "/manager/pipeline", icon: Activity },
    { name: "KI Personas", href: "/manager/ki-personas", icon: User2 },
    { name: "MIRA AI", href: "/manager/mira-ai", icon: Mailbox },
    { name: "Leads", href: "/manager/lead-database", icon: Building2 },
    { name: "Train AI", href: "/manager/train-ai", icon: Activity },
    { name: "Settings", href: "/manager/settings/profile", icon: Settings }
  ],
  customer: [
    { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/customer/projects", icon: FolderKanban },
    { name: "Pipeline", href: "/customer/pipeline", icon: Activity },
    { name: "Lead Database", href: "/customer/lead-database", icon: Building2 },
    // MIRA AI item removed as requested
    { name: "KI Personas", href: "/customer/ki-personas", icon: User2 },
    { name: "Train AI", href: "/customer/train-ai", icon: Activity },
    { name: "Search Strings", href: "/customer/search-strings", icon: Search },
    { name: "Statistics", href: "/customer/statistics", icon: TrendingUp, 
      badge: {
        text: "Soon",
        variant: "default"
      }
    },
    { name: "Outreach", href: "/customer/outreach", icon: Wallet,
      badge: {
        text: "Soon",
        variant: "default"
      }
    },
    { name: "Settings", href: "/customer/settings/profile", icon: Settings }
  ]
};
