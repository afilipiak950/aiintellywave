
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Zap } from 'lucide-react';

const TriggerNode = ({ data }: { data: any }) => {
  return (
    <Card className="px-4 py-3 min-w-[180px] border-2 border-amber-300 shadow-md bg-amber-50">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-sm flex items-center">
            <Zap className="h-4 w-4 mr-1 text-amber-500" />
            {data.label}
          </div>
          {data.description && (
            <div className="text-xs text-gray-600">{data.description}</div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-amber-500 border-2 border-white"
      />
    </Card>
  );
};

export default memo(TriggerNode);
