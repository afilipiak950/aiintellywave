
import React from 'react';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from '@/hooks/use-toast';
import { AIPersona } from '@/types/persona';
import { PersonaCreationForm } from './components/PersonaCreationForm';
import { AnalysisSummary } from './components/AnalysisSummary';
import { PersonaCreationFormValues } from './schemas/persona-form-schema';

interface PersonaCreationSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  aggregatedAnalysis: any;
  suggestedPersona: Partial<AIPersona> | null;
  onSubmit: (values: PersonaCreationFormValues) => Promise<void>;
}

export function PersonaCreationSheet({ 
  isOpen, 
  onOpenChange, 
  aggregatedAnalysis, 
  suggestedPersona,
  onSubmit
}: PersonaCreationSheetProps) {
  
  const handleFormSubmit = async (values: PersonaCreationFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting persona:', error);
      toast({
        title: "Error",
        description: "Failed to create persona. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!aggregatedAnalysis) return null;

  return (
    <SheetContent className="sm:max-w-[1200px] h-[50vh] my-auto flex flex-col p-6 overflow-y-auto">
      <SheetHeader className="pb-4">
        <SheetTitle>Create KI Persona from Analysis</SheetTitle>
        <SheetDescription>
          Create a new persona based on the analysis of {aggregatedAnalysis?.analysisCount || 0} emails
        </SheetDescription>
      </SheetHeader>
      
      <div className="flex flex-row gap-6 flex-grow overflow-y-auto">
        <div className="w-1/3">
          <AnalysisSummary aggregatedAnalysis={aggregatedAnalysis} />
        </div>
        <div className="w-2/3">
          <PersonaCreationForm 
            suggestedPersona={suggestedPersona}
            onSubmit={handleFormSubmit}
          />
        </div>
      </div>
    </SheetContent>
  );
}

