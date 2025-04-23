
export interface LeadFetchOptions {
  projectId?: string;
  status?: string; // Accept any string status, validation will happen elsewhere
  assignedToUser?: boolean;
  companyId?: string;
  limit?: number;
}

export interface FallbackProjectLead {
  project_name: string;
  website?: string | null; // Use optional property with string or null type to match Lead type
  extra_data?: Record<string, any> | null;
}
