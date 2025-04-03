
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const ActionNode = ({ data }: { data: any }) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <Card className="px-4 py-3 min-w-[180px] border-2 shadow-md bg-white">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-500 border-2 border-white"
      />
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-sm">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-500">{data.description}</div>
          )}
        </div>
        <div className="ml-2">{getStatusIcon()}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-blue-500 border-2 border-white"
      />
    </Card>
  );
};

export default memo(ActionNode);
