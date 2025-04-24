
import React from 'react';
import { Loader2 } from 'lucide-react';

const PipelineLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Lade Projektdaten...</p>
        <p className="text-xs text-muted-foreground mt-2">Dies kann einen Moment dauern</p>
      </div>
    </div>
  );
};

export default PipelineLoading;
