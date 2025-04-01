
import { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  description?: string;
  change?: { value: string; isPositive: boolean };
  trend?: { value: string; positive: boolean }; // For backward compatibility
  bgColor?: string;
  loading?: boolean; // Added loading prop
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  change,
  trend, // Support legacy trend prop
  bgColor = "bg-white",
  loading = false // Default to false
}: StatCardProps) => {
  // Convert trend to change format if trend is provided but change is not
  const displayChange = change || (trend ? { value: trend.value, isPositive: trend.positive } : undefined);
  
  return (
    <div className={`${bgColor} p-6 rounded-xl shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {loading ? (
            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
        </div>
        {icon && <div className="rounded-full p-2 bg-white bg-opacity-50">{icon}</div>}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
      
      {!loading && displayChange && (
        <div className="mt-4 flex items-center">
          <div className={cn(
            "text-xs font-medium mr-1",
            displayChange.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {displayChange.isPositive ? 
              <ArrowUpIcon className="inline h-3 w-3 mr-0.5" /> : 
              <ArrowDownIcon className="inline h-3 w-3 mr-0.5" />
            }
            {displayChange.value}%
          </div>
          <div className="text-xs text-gray-500">vs previous</div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
