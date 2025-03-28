
import React from 'react';
import { Progress } from "../../progress";

interface MilestoneProgressProps {
  taskCount: number;
  completedTaskCount: number;
}

const MilestoneProgress: React.FC<MilestoneProgressProps> = ({ 
  taskCount, 
  completedTaskCount 
}) => {
  const progressPercentage = taskCount > 0 
    ? Math.round((completedTaskCount / taskCount) * 100)
    : 0;

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progress</span>
        <span>{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default MilestoneProgress;
