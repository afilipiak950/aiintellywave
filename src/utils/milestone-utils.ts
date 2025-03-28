
import { Hourglass, AlertCircle, CheckCircle, Clock, LucideIcon } from 'lucide-react';

export const statusColors: Record<string, string> = {
  'pending': 'bg-blue-100 text-blue-700',
  'in_progress': 'bg-amber-100 text-amber-700',
  'completed': 'bg-green-100 text-green-700',
};

export const statusIcons: Record<string, LucideIcon> = {
  'pending': Clock,
  'in_progress': AlertCircle,
  'completed': CheckCircle,
};

export const getStatusIcon = (status: string): LucideIcon => {
  return statusIcons[status as keyof typeof statusIcons] || Clock;
};

export const getStatusColor = (status: string): string => {
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';
};

// Helper to determine if a milestone and its tasks are in sync
export const shouldSyncMilestoneStatus = (
  milestone: { status: string; taskCount: number; completedTaskCount: number }
): boolean => {
  // If there are no tasks, no need to sync
  if (milestone.taskCount === 0) return false;
  
  // If all tasks are complete but milestone isn't, suggest sync
  if (milestone.completedTaskCount === milestone.taskCount && milestone.status !== 'completed') {
    return true;
  }
  
  // If some tasks are complete and milestone is still pending, suggest in_progress
  if (milestone.completedTaskCount > 0 && milestone.completedTaskCount < milestone.taskCount && 
      milestone.status === 'pending') {
    return true;
  }
  
  // If no tasks are complete but milestone is completed, suggest sync back
  if (milestone.completedTaskCount === 0 && milestone.status === 'completed') {
    return true;
  }
  
  return false;
};

// Get suggested status based on task completion
export const getSuggestedMilestoneStatus = (
  taskCount: number, 
  completedTaskCount: number
): string => {
  if (taskCount === 0) return 'pending';
  if (completedTaskCount === taskCount) return 'completed';
  if (completedTaskCount > 0) return 'in_progress';
  return 'pending';
};
