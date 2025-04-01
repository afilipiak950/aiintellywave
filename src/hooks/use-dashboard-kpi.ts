
import { useState } from 'react';
import { updateKpiMetric } from '@/services/kpi-service';
import { toast } from '@/hooks/use-toast';

export interface KpiMetric {
  id: string;
  name: string;
  value: number;
  previous_value: number;
  updated_at: string;
}

export const useDashboardKpi = () => {
  const [editingKpi, setEditingKpi] = useState<string | null>(null);
  const [kpiValue, setKpiValue] = useState('');
  
  const openKpiEditor = (kpiName: string, currentValue: number) => {
    setEditingKpi(kpiName);
    setKpiValue(currentValue.toString());
  };
  
  const handleSaveKpi = async (kpiToUpdate: KpiMetric | null) => {
    try {
      if (!kpiToUpdate) {
        toast({
          title: "Error",
          description: "No KPI selected to update",
          variant: "destructive"
        });
        return;
      }
      
      const numericValue = parseFloat(kpiValue);
      if (isNaN(numericValue)) {
        toast({
          title: "Invalid Value",
          description: "Please enter a valid number",
          variant: "destructive"
        });
        return;
      }
      
      const success = await updateKpiMetric(kpiToUpdate.name, numericValue);
      
      if (!success) {
        throw new Error("Failed to update KPI");
      }
      
      toast({
        title: "KPI Updated",
        description: "The KPI value has been updated successfully",
      });
      
      setEditingKpi(null);
      setKpiValue('');
      
      return {
        ...kpiToUpdate,
        previous_value: kpiToUpdate.value,
        value: numericValue,
        updated_at: new Date().toISOString()
      };
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };
  
  return {
    editingKpi,
    kpiValue,
    setKpiValue,
    openKpiEditor,
    handleSaveKpi,
    setEditingKpi
  };
};
