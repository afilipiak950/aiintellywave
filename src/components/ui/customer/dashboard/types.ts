
export type LeadsByStatusData = {
  name: string;
  value: number;
  color: string;
};

export type LeadsByProjectData = {
  name: string;
  leads: number;
  color: string;
};

export type Lead = {
  id: string;
  project_id?: string;
  status?: string;
  extra_data?: Record<string, any>;
  [key: string]: any;
};

export type Project = {
  id: string;
  name: string;
  company_id: string;
  status?: string;
  [key: string]: any;
};

// For convenience, using a predefined set of colors for charts
export const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#8DD1E1', '#A4DE6C', '#D0ED57'
];

// Define status-specific colors
export const STATUS_COLORS: Record<string, string> = {
  new: '#4ade80', // green
  contacted: '#60a5fa', // blue
  engaged: '#f59e0b', // amber
  qualified: '#8b5cf6', // purple
  converted: '#10b981', // emerald
  closed: '#ef4444', // red
  rejected: '#6b7280', // gray
  unknown: '#9ca3af' // gray
};
