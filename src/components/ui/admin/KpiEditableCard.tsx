
import { ReactNode } from 'react';
import { KpiMetric } from '@/hooks/use-dashboard-kpi';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2 } from 'lucide-react';
import StatCard from '../dashboard/StatCard';

interface KpiEditableCardProps {
  title: string;
  kpi: KpiMetric | null;
  icon: ReactNode;
  isPercentage?: boolean;
  bgColor: string;
  isEditing: boolean;
  kpiValue: string;
  onEdit: (kpiName: string, value: number) => void;
  onSave: () => void;
  onCancel: () => void;
  setKpiValue: (value: string) => void;
  loading?: boolean;
}

const KpiEditableCard = ({
  title,
  kpi,
  icon,
  isPercentage = false,
  bgColor,
  isEditing,
  kpiValue,
  onEdit,
  onSave,
  onCancel,
  setKpiValue,
  loading = false
}: KpiEditableCardProps) => {
  // Format the value for display
  const formatKpiValue = (kpi: KpiMetric | null) => {
    if (!kpi) return isPercentage ? "0%" : "€0";
    return isPercentage ? `${kpi.value}%` : `€${kpi.value.toLocaleString()}`;
  };
  
  // Calculate growth percentage
  const calculateGrowth = (current: number, previous: number): { value: string, isPositive: boolean } => {
    if (!previous) return { value: '0.0', isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };

  return (
    <Popover open={isEditing} onOpenChange={(open) => !open && onCancel()}>
      <PopoverTrigger asChild>
        <div className="relative">
          <StatCard
            title={title}
            value={loading ? "..." : formatKpiValue(kpi)}
            icon={icon}
            change={kpi ? calculateGrowth(kpi.value, kpi.previous_value) : { value: "0.0", isPositive: true }}
            bgColor={bgColor}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-2 right-2 p-1 h-auto"
            onClick={() => kpi && onEdit(kpi.name, kpi.value)}
          >
            <Edit2 size={16} />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Update {title}</h4>
          <div className="flex items-center space-x-2">
            {!isPercentage && <span>€</span>}
            <Input 
              type="number" 
              value={kpiValue} 
              onChange={(e) => setKpiValue(e.target.value)}
              placeholder={isPercentage ? "Enter percentage" : "Enter amount"}
            />
            {isPercentage && <span>%</span>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default KpiEditableCard;
