
import { BarChart3, BookOpen, BuildingIcon, Calendar, ChevronRight, HeartHandshake, LayoutGrid, Lightbulb, LineChart, Link, MessageCircle, Network, PanelLeft, Scaling, Search, ServerCog, Settings, Smartphone, Clock, User, Users } from "lucide-react";
import { NavItemsByRole } from "./types";

// Define Manager KPI item for use in dynamic navigation
export const MANAGER_KPI_ITEM = {
  name: "Manager KPI",
  href: "/customer/manager-kpi",
  path: "/customer/manager-kpi",
  icon: BarChart3
};

export const NAV_ITEMS: NavItemsByRole = {
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
    { name: "Projects", href: "/admin/projects", icon: Clock },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Pipeline", href: "/admin/pipeline", icon: Network },
    { name: "KI Personas", href: "/admin/ki-personas", icon: Smartphone },
    { name: "MIRA AI", href: "/admin/mira-ai", icon: MessageCircle },
    { name: "Revenue", href: "/admin/revenue", icon: LineChart },
  ],
  manager: [
    { name: "Dashboard", href: "/manager/dashboard", icon: LayoutGrid },
    { name: "Projects", href: "/manager/projects", icon: Clock },
    { name: "Customers", href: "/manager/customers", icon: Users },
    { name: "Pipeline", href: "/manager/pipeline", icon: Network },
    { name: "KI Personas", href: "/manager/ki-personas", icon: Smartphone },
    { name: "MIRA AI", href: "/manager/mira-ai", icon: MessageCircle },
    { name: "Leads", href: "/manager/lead-database", icon: HeartHandshake },
    { name: "Train AI", href: "/manager/train-ai", icon: ServerCog },
  ],
  customer: [
    { name: "Dashboard", href: "/customer/dashboard", icon: LayoutGrid },
    { name: "Projects", href: "/customer/projects", icon: BookOpen },
    { name: "Pipeline", href: "/customer/pipeline", icon: Network },
    { name: "Lead Database", href: "/customer/lead-database", icon: HeartHandshake },
    { name: "MIRA AI", href: "/customer/mira-ai", icon: MessageCircle },
    { name: "KI Personas", href: "/customer/ki-personas", icon: Smartphone },
    { name: "Train AI", href: "/customer/train-ai", icon: ServerCog },
    { 
      name: "Statistics", 
      href: "/customer/statistics", 
      icon: BarChart3,
      badge: {
        text: "Soon",
        variant: "default"
      }
    },
    { 
      name: "Outreach", 
      href: "/customer/outreach", 
      icon: Scaling,
      badge: {
        text: "Soon",
        variant: "default"
      }
    },
    { name: "Settings", href: "/customer/settings/profile", icon: Settings },
    { name: "Integrations", href: "/customer/integrations", icon: Link },
    { name: "Appointments", href: "/customer/appointments", icon: Calendar },
  ]
};
