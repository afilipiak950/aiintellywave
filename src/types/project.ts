
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
