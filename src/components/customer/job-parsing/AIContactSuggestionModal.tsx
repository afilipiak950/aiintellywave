
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCopy } from 'lucide-react';

interface AIContactSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: string | null; // Changed to accept string instead of AISuggestion
}

const AIContactSuggestionModal: React.FC<AIContactSuggestionModalProps> = ({ 
  isOpen, 
  onClose, 
  suggestion 
}) => {
  if (!isOpen) {
    return null;
  }

  const copyToClipboard = () => {
    if (suggestion) {
      navigator.clipboard.writeText(suggestion);
      // Could add a toast here to indicate successful copying
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>KI-Kontaktvorschlag</CardTitle>
          <CardDescription>
            Basierend auf den gefundenen Jobangeboten hat unsere KI einen Kontaktvorschlag erstellt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestion ? (
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
              {suggestion}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              Kein Vorschlag verfügbar
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onClose}>
            Schließen
          </Button>
          <Button 
            variant="outline" 
            onClick={copyToClipboard}
            disabled={!suggestion}
            className="flex items-center"
          >
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Kopieren
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIContactSuggestionModal;
