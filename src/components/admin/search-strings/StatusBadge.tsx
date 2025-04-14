
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SearchStringStatus } from '@/hooks/search-strings/search-string-types';

interface StatusBadgeProps {
  status: SearchStringStatus;
  isProcessed: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isProcessed }) => {
  let variant: 
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | null
    | undefined;
  let label: string = status;
  
  switch (status) {
    case 'new':
      variant = 'outline';
      label = 'New';
      break;
    case 'processing':
      variant = 'secondary';
      label = 'Processing';
      break;
    case 'completed':
      variant = isProcessed ? 'outline' : 'default';
      label = isProcessed ? 'Processed' : 'Completed';
      break;
    case 'failed':
      variant = 'destructive';
      label = 'Failed';
      break;
    case 'canceled':
      variant = 'outline';
      label = 'Canceled';
      break;
    default:
      variant = 'outline';
  }
  
  return <Badge variant={variant}>{label}</Badge>;
};

export default StatusBadge;
