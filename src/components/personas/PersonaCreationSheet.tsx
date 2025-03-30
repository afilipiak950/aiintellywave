
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
    <SheetContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
      <SheetHeader className="mb-4">
        <SheetTitle>Create KI Persona from Analysis</SheetTitle>
        <SheetDescription>
          Create a new persona based on the analysis of {aggregatedAnalysis?.analysisCount || 0} emails
        </SheetDescription>
      </SheetHeader>
      
      <div className="flex-grow overflow-y-auto space-y-6 py-4">
        <AnalysisSummary aggregatedAnalysis={aggregatedAnalysis} />
        <PersonaCreationForm 
          suggestedPersona={suggestedPersona}
          onSubmit={handleFormSubmit}
        />
      </div>
    </SheetContent>
  );
}
