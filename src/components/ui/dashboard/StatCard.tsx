
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  trend?: {
    value: string;
    positive: boolean;
  };
  bgColor?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  change,
  trend,
  bgColor = 'bg-white'
}: StatCardProps) => {
  return (
    <div className={`${bgColor} shadow-sm rounded-xl p-6 transition-transform duration-200 hover:translate-y-[-5px] hover:shadow-md animate-fade-in`}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          
          {change && (
            <div className={`inline-flex items-center text-sm ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-1">
                {change.isPositive ? '↑' : '↓'}
              </span>
              <span>{Math.abs(change.value)}%</span>
              <span className="ml-1 text-gray-500">vs last month</span>
            </div>
          )}
          
          {trend && (
            <div className={`inline-flex items-center text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-1">
                {trend.positive ? '↑' : '↓'}
              </span>
              <span>{trend.value}</span>
              <span className="ml-1 text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        
        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
