
import { 
  FileText, Clock, CheckCircle, XCircle, 
  AlertTriangle, LucideIcon
} from 'lucide-react';

export const statusColors: Record<string, string> = {
  'planning': 'bg-blue-100 text-blue-700',
  'in_progress': 'bg-amber-100 text-amber-700',
  'review': 'bg-purple-100 text-purple-700',
  'completed': 'bg-green-100 text-green-700',
  'canceled': 'bg-red-100 text-red-700',
};

export const statusIcons: Record<string, LucideIcon> = {
  'planning': FileText,
  'in_progress': Clock,
  'review': AlertTriangle,
  'completed': CheckCircle,
  'canceled': XCircle,
};

export const getStatusIcon = (status: string | undefined): LucideIcon => {
  if (!status) return FileText;
  return statusIcons[status] || FileText;
};
