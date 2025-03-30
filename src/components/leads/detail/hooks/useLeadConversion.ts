
import { useState } from 'react';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

interface UseLeadConversionProps {
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
  onClose: () => void;
}

export const useLeadConversion = ({ onUpdate, onClose }: UseLeadConversionProps) => {
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async (lead: Lead) => {
    setIsConverting(true);
    try {
      const updatedLead = await onUpdate(lead.id, { status: 'qualified' });
      if (updatedLead) {
        toast({
          title: "Lead Converted",
          description: "Successfully converted to candidate",
          variant: "default",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert lead",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return { handleConvert, isConverting };
};
