
export interface Lead {
  id: string;
  name: string;
  status: string;
  company?: string;
  score?: number;
  project_id?: string;
  extra_data?: { [key: string]: any; source?: string; };
}

export interface Project {
  id: string;
  name: string;
  status: string;
  company_id: string;
}

export interface LeadsByStatusData {
  name: string;
  value: number;
  color: string;
}

export interface LeadsByProjectData {
  name: string;
  leads: number;
  color: string;
}

export const STATUS_COLORS: Record<string, string> = {
  new: '#0088FE',
  contacted: '#00C49F',
  qualified: '#FFBB28',
  proposal: '#FF8042',
  negotiation: '#8884D8',
  won: '#48C9B0',
  lost: '#A569BD'
};

export const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'
];
