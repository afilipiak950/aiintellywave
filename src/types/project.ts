// Project-related types
export interface ExcelRow {
  id: string;
  row_number: number;
  row_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_by: string;
  project_id: string;
  created_at: string;
  uploader_name?: string;
}

export interface Feedback {
  id: string;
  content: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  created_at: string;
  is_deleted: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  taskCount: number;
  completedTaskCount: number;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_user_name?: string;
  created_at: string;
  updated_at: string;
}

// Updated Project interface to include assigned_to
export interface Project {
  id: string;
  name: string;
  description?: string;
  status?: string;
  company_id?: string;
  assigned_to?: string;  // Added assigned_to property
  // Other optional properties
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
}

// Add more flexible type definitions for database queries
export type DatabaseRow = {
  id: string;
  [key: string]: any;
};

export interface ProjectExcelRow extends DatabaseRow {
  project_id: string;
  row_number: number;
  row_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProjectFeedbackRow extends DatabaseRow {
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
}

export interface ProjectFileRow extends DatabaseRow {
  project_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  uploaded_by: string;
  created_at: string;
}

export interface ProjectMilestoneRow extends DatabaseRow {
  project_id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectTaskRow extends DatabaseRow {
  project_id: string;
  milestone_id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}
