
export interface WorkflowNode {
  id: string;
  name: string;
  description?: string;
  type?: 'trigger' | 'action';
  status?: 'pending' | 'success' | 'error';
}

export interface WorkflowConnection {
  from: string;
  to: string;
  label?: string;
  status?: 'active' | 'inactive' | 'error';
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections?: WorkflowConnection[];
  active: boolean;
  lastExecuted?: string;
}
