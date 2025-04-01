
import { useState } from 'react';
import { CustomerMetric } from '@/types/customer-metrics';
import { upsertCustomerMetrics } from '@/services/customer-metrics-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowTrendingUpIcon, CurrencyEuroIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CustomerMetricsFormProps {
  customerId: string;
  metrics: CustomerMetric | null;
  onMetricsUpdated: () => void;
  readOnly?: boolean;
}

export const CustomerMetricsForm = ({
  customerId,
  metrics,
  onMetricsUpdated,
  readOnly = false
}: CustomerMetricsFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    conversion_rate: metrics?.conversion_rate || 0,
    booking_candidates: metrics?.booking_candidates || 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    
    setIsSubmitting(true);
    try {
      await upsertCustomerMetrics(customerId, formData);
      toast({
        title: "Metrics Updated",
        description: "Customer performance metrics have been updated successfully."
      });
      onMetricsUpdated();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium">Performance Metrics</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="conversion_rate" className="flex items-center gap-1">
              <ArrowTrendingUpIcon className="h-4 w-4" />
              Conversion Rate (%)
            </Label>
            <div className="relative">
              <Input
                id="conversion_rate"
                name="conversion_rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.conversion_rate}
                onChange={handleChange}
                disabled={readOnly || isSubmitting}
                className="pr-8"
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
            {metrics?.previous_conversion_rate !== undefined && metrics.previous_conversion_rate !== null && (
              <p className="text-xs text-gray-500">
                Previous: {metrics.previous_conversion_rate}%
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="booking_candidates" className="flex items-center gap-1">
              <CurrencyEuroIcon className="h-4 w-4" />
              Booking w. Candidates (€)
            </Label>
            <div className="relative">
              <Input
                id="booking_candidates"
                name="booking_candidates"
                type="number"
                min="0"
                step="100"
                value={formData.booking_candidates}
                onChange={handleChange}
                disabled={readOnly || isSubmitting}
                className="pl-7"
              />
              <span className="absolute left-3 top-2 text-gray-500">€</span>
            </div>
            {metrics?.previous_booking_candidates !== undefined && metrics.previous_booking_candidates !== null && (
              <p className="text-xs text-gray-500">
                Previous: €{metrics.previous_booking_candidates.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        {!readOnly && (
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Metrics"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
