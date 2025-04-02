
import { Home, Users, FolderKanban, Database, PieChart, BarChart2, Bot, BookOpen, Settings, Award, MailQuestion, LineChart } from "lucide-react";
import { NavItem, NavItemsByRole } from './types';

// Common navigation items shared between different user types
export const DASHBOARD_ITEM = {
  title: "Dashboard",
  path: "/customer/dashboard",
  icon: Home
};

export const PROJECTS_ITEM = {
  title: "Projects",
  path: "/customer/projects",
  icon: FolderKanban
};

export const LEAD_DATABASE_ITEM = {
  title: "Lead Database",
  path: "/customer/lead-database",
  icon: Database
};

export const PIPELINE_ITEM = {
  title: "Pipeline",
  path: "/customer/pipeline",
  icon: PieChart
};

export const APPOINTMENTS_ITEM = {
  title: "Appointments",
  path: "/customer/appointments", 
  icon: BarChart2
};

export const MIRA_AI_ITEM = {
  title: "Mira AI",
  path: "/customer/mira-ai",
  icon: Bot
};

export const TRAIN_AI_ITEM = {
  title: "Train AI",
  path: "/customer/train-ai",
  icon: BookOpen
};

export const KI_PERSONAS_ITEM = {
  title: "KI Personas",
  path: "/customer/ki-personas",
  icon: Users
};

export const STATISTICS_ITEM = {
  title: "Statistics",
  path: "/customer/statistics",
  icon: LineChart
};

export const OUTREACH_ITEM = {
  title: "Outreach",
  path: "/customer/outreach",
  icon: MailQuestion
};

export const SETTINGS_ITEM = {
  title: "Settings",
  path: "/customer/settings/profile",
  icon: Settings
};

// Manager KPI Dashboard item
export const MANAGER_KPI_ITEM = {
  title: "Manager KPI",
  path: "/customer/manager-kpi",
  icon: Award
};

// Base navigation - common items shared between all user types
export const BASE_NAV_ITEMS = [
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
