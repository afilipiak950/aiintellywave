
import { useState } from 'react';
import { EmailMessage, EmailAnalysis, AIPersona } from '@/types/persona';

export function useDialogsState() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [analysisData, setAnalysisData] = useState<EmailAnalysis | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isPersonaSheetOpen, setIsPersonaSheetOpen] = useState(false);
  const [suggestedPersona, setSuggestedPersona] = useState<Partial<AIPersona> | null>(null);
  const [aggregatedAnalysis, setAggregatedAnalysis] = useState<any>(null);

  return {
    isImportDialogOpen,
    setIsImportDialogOpen,
    selectedEmail,
    setSelectedEmail,
    analysisData,
    setAnalysisData,
    isAnalysisDialogOpen,
    setIsAnalysisDialogOpen,
    isPersonaSheetOpen,
    setIsPersonaSheetOpen,
    suggestedPersona,
    setSuggestedPersona,
    aggregatedAnalysis,
    setAggregatedAnalysis,
  };
}
