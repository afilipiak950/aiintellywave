
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SearchStringStatus } from '@/hooks/search-strings/search-string-types';

interface StatusBadgeProps {
  status: SearchStringStatus;
  isProcessed?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isProcessed }) => {
  if (isProcessed) {
    return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Processed</Badge>;
  }
  
  switch (status) {
    case 'new':
      return <Badge variant="outline">New</Badge>;
    case 'processing':
      return <Badge variant="secondary">Processing</Badge>;
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    case 'canceled':
      return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">Canceled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default StatusBadge;
