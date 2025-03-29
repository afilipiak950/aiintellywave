
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { LeadStatus } from '@/types/lead';

interface LeadDialogContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expandedFields: Record<string, boolean>;
  toggleExpand: (key: string) => void;
  animationComplete: boolean;
}

const LeadDialogContext = createContext<LeadDialogContextType | undefined>(undefined);

export const useLeadDialog = () => {
  const context = useContext(LeadDialogContext);
  if (!context) {
    throw new Error('useLeadDialog must be used within a LeadDialogProvider');
  }
  return context;
};

interface LeadDialogProviderProps {
  children: ReactNode;
}

export const LeadDialogProvider = ({ children }: LeadDialogProviderProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Reset animation state after mounting
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 400);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Toggle expanded state for text fields
  const toggleExpand = (key: string) => {
    setExpandedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const value = {
    activeTab,
    setActiveTab,
    expandedFields,
    toggleExpand,
    animationComplete
  };

  return (
    <LeadDialogContext.Provider value={value}>
      {children}
    </LeadDialogContext.Provider>
  );
};
