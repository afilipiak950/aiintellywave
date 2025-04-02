
import { Home, Users, FolderKanban, Database, PieChart, BarChart2, Bot, BookOpen, Settings, Award, MailQuestion, LineChart } from "lucide-react";
import { NavItem, NavItemsByRole } from './types';

// Common navigation items shared between different user types
export const DASHBOARD_ITEM: NavItem = {
  name: "Dashboard",
  title: "Dashboard",
  href: "/customer/dashboard",
  path: "/customer/dashboard",
  icon: Home
};

export const PROJECTS_ITEM: NavItem = {
  name: "Projects",
  title: "Projects",
  href: "/customer/projects",
  path: "/customer/projects",
  icon: FolderKanban
};

export const LEAD_DATABASE_ITEM: NavItem = {
  name: "Lead Database",
  title: "Lead Database",
  href: "/customer/lead-database",
  path: "/customer/lead-database",
  icon: Database
};

export const PIPELINE_ITEM: NavItem = {
  name: "Pipeline",
  title: "Pipeline",
  href: "/customer/pipeline",
  path: "/customer/pipeline",
  icon: PieChart
};

export const APPOINTMENTS_ITEM: NavItem = {
  name: "Appointments",
  title: "Appointments",
  href: "/customer/appointments", 
  path: "/customer/appointments", 
  icon: BarChart2
};

export const MIRA_AI_ITEM: NavItem = {
  name: "Mira AI",
  title: "Mira AI",
  href: "/customer/mira-ai",
  path: "/customer/mira-ai",
  icon: Bot
};

export const TRAIN_AI_ITEM: NavItem = {
  name: "Train AI",
  title: "Train AI",
  href: "/customer/train-ai",
  path: "/customer/train-ai",
  icon: BookOpen
};

export const KI_PERSONAS_ITEM: NavItem = {
  name: "KI Personas",
  title: "KI Personas",
  href: "/customer/ki-personas",
  path: "/customer/ki-personas",
  icon: Users
};

export const STATISTICS_ITEM: NavItem = {
  name: "Statistics",
  title: "Statistics",
  href: "/customer/statistics",
  path: "/customer/statistics",
  icon: LineChart
};

export const OUTREACH_ITEM: NavItem = {
  name: "Outreach",
  title: "Outreach",
  href: "/customer/outreach",
  path: "/customer/outreach",
  icon: MailQuestion
};

export const SETTINGS_ITEM: NavItem = {
  name: "Settings",
  title: "Settings",
  href: "/customer/settings/profile",
  path: "/customer/settings/profile",
  icon: Settings
};

// Manager KPI Dashboard item
export const MANAGER_KPI_ITEM: NavItem = {
  name: "Manager KPI",
  title: "Manager KPI",
  href: "/customer/manager-kpi",
  path: "/customer/manager-kpi",
  icon: Award
};

// Base navigation - common items shared between all user types
export const BASE_NAV_ITEMS: NavItem[] = [
  DASHBOARD_ITEM,
  PROJECTS_ITEM,
  LEAD_DATABASE_ITEM,
  PIPELINE_ITEM,
  APPOINTMENTS_ITEM,
  MIRA_AI_ITEM,
  TRAIN_AI_ITEM,
  KI_PERSONAS_ITEM,
  STATISTICS_ITEM,
  OUTREACH_ITEM,
  SETTINGS_ITEM
];

// Define navigation items for different user roles
export const NAV_ITEMS: NavItemsByRole = {
  admin: [
    DASHBOARD_ITEM,
    PROJECTS_ITEM,
    PIPELINE_ITEM,
    MIRA_AI_ITEM,
    KI_PERSONAS_ITEM,
    SETTINGS_ITEM
  ],
  manager: [
    DASHBOARD_ITEM,
    PROJECTS_ITEM,
    LEAD_DATABASE_ITEM,
    PIPELINE_ITEM,
    APPOINTMENTS_ITEM,
    MIRA_AI_ITEM,
    KI_PERSONAS_ITEM,
    STATISTICS_ITEM,
    SETTINGS_ITEM
  ],
  customer: [
    DASHBOARD_ITEM,
    PROJECTS_ITEM,
    LEAD_DATABASE_ITEM,
    PIPELINE_ITEM,
    APPOINTMENTS_ITEM,
    MIRA_AI_ITEM,
    TRAIN_AI_ITEM,
    KI_PERSONAS_ITEM,
    STATISTICS_ITEM,
    OUTREACH_ITEM,
    SETTINGS_ITEM
  ]
};
