
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface KpiSimpleCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  description?: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  bgColor?: string;
  loading?: boolean;
  errorState?: {
    message: string;
    retry: () => void;
    isRetrying: boolean;
  };
}

const KpiSimpleCard = ({
  title,
  value,
  icon,
  description,
  change,
  bgColor = "bg-white",
  loading = false,
  errorState
}: KpiSimpleCardProps) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Debug output for troubleshooting
  useEffect(() => {
    if (errorState) {
      console.log(`KpiSimpleCard "${title}" rendered with error state, retry available:`, !!errorState?.retry);
    }
  }, [errorState, title]);

  const handleRetryClick = () => {
    console.log(`Retry button clicked in KpiSimpleCard "${title}"`);
    if (errorState?.retry) {
      setIsAnimating(true);
      errorState.retry();
      
      // Reset animation state after a delay
      setTimeout(() => {
        setIsAnimating(false);
      }, 3000);
    }
  };

  return (
    <div className={`${bgColor} p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
        </div>
        {icon && <div className="rounded-full p-2 bg-white bg-opacity-50">{icon}</div>}
      </div>
      
      {description && !errorState && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
      
      {errorState && (
        <div className="mt-1">
          <p className="text-sm text-red-600 mb-1">{errorState.message}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center"
            onClick={handleRetryClick}
            disabled={errorState.isRetrying || isAnimating}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${(errorState.isRetrying || isAnimating) ? 'animate-spin' : ''}`} />
            {errorState.isRetrying || isAnimating ? 'Retrying...' : 'Retry Now'}
          </Button>
        </div>
      )}
      
      {!loading && !errorState && change && (
        <div className="mt-4 flex items-center">
          <div className={`text-xs font-medium mr-1 ${change.isPositive ? "text-green-600" : "text-red-600"}`}>
            {change.isPositive ? "+" : "-"}
            {change.value}%
          </div>
          <div className="text-xs text-gray-500">vs previous period</div>
        </div>
      )}
    </div>
  );
};

export default KpiSimpleCard;
