
import { useState } from 'react';

export function useEmailSelection() {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isEmailListExpanded, setIsEmailListExpanded] = useState(false);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);

  const toggleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleToggleExpand = () => {
    setIsEmailListExpanded(!isEmailListExpanded);
  };

  return {
    selectedEmails,
    setSelectedEmails,
    isEmailListExpanded,
    setIsEmailListExpanded,
    isBatchAnalyzing,
    setIsBatchAnalyzing,
    toggleSelectEmail,
    handleToggleExpand,
  };
}
