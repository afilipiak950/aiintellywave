
import React from 'react';
import { Progress } from "../../progress";

interface MilestoneProgressProps {
  taskCount: number;
  completedTaskCount: number;
}

const MilestoneProgress: React.FC<MilestoneProgressProps> = ({ 
  taskCount = 0, 
  completedTaskCount = 0 
}) => {
  // Ensure we have valid numbers with defaults
  const safeTaskCount = typeof taskCount === 'number' ? taskCount : 0;
  const safeCompletedTaskCount = typeof completedTaskCount === 'number' ? completedTaskCount : 0;
  
  // Calculate progress percentage safely
  const progressPercentage = safeTaskCount > 0 
    ? Math.round((safeCompletedTaskCount / safeTaskCount) * 100)
    : 0;

  // Determine progress color based on completion
  const progressColor = 
    progressPercentage === 100 ? "bg-green-500" :
    progressPercentage > 50 ? "bg-blue-500" :
    "bg-blue-400";

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progress</span>
        <span>{progressPercentage}%</span>
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-2" 
        indicatorClassName={progressColor}
      />
      <div className="text-xs text-gray-500 mt-1">
        {safeCompletedTaskCount} of {safeTaskCount} tasks completed
      </div>
    </div>
  );
};

export default MilestoneProgress;
