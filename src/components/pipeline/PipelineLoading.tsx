
import React from 'react';

const PipelineLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading pipeline data...</p>
      </div>
    </div>
  );
};

export default PipelineLoading;
