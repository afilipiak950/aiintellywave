
import { Hourglass, AlertCircle, CheckCircle, LucideIcon } from 'lucide-react';

export const statusColors: Record<string, string> = {
  'pending': 'bg-blue-100 text-blue-700',
  'in_progress': 'bg-amber-100 text-amber-700',
  'completed': 'bg-green-100 text-green-700',
};

export const statusIcons: Record<string, LucideIcon> = {
  'pending': Hourglass,
  'in_progress': AlertCircle,
  'completed': CheckCircle,
};

export const getStatusIcon = (status: string): LucideIcon => {
  return statusIcons[status as keyof typeof statusIcons] || Hourglass;
};

export const getStatusColor = (status: string): string => {
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';
};
