
export interface LeadFetchOptions {
  projectId?: string;
  status?: string;
  assignedToUser?: boolean;
  companyId?: string;
  limit?: number;
}

export interface FallbackProjectLead {
  project_name: string;
  website: null;
  extra_data: Record<string, any> | null;
}
