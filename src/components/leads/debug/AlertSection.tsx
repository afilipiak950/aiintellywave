
import { Check, X, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface AlertSectionProps {
  title: string;
  hasError?: boolean;
  isSuccess?: boolean;
  isWarning?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const AlertSection = ({ 
  title, 
  hasError, 
  isSuccess, 
  isWarning,
  className = "", 
  children 
}: AlertSectionProps) => {
  const Icon = hasError ? X : isSuccess ? Check : AlertCircle;
  const iconColor = hasError ? "text-red-500" : isSuccess ? "text-green-500" : "text-yellow-500";
  
  return (
    <Alert className={`${className} ${
      hasError ? "bg-red-50" : 
      isSuccess ? "bg-green-50" : 
      isWarning ? "bg-yellow-50" : 
      "bg-slate-50"
    }`}>
      <AlertTitle className="flex items-center">
        <Icon className={`h-4 w-4 ${iconColor} mr-2`} />
        {title}
      </AlertTitle>
      <AlertDescription>
        {children}
      </AlertDescription>
    </Alert>
  );
};
