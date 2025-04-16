
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AIContactSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: string | null;
}

const AIContactSuggestionModal: React.FC<AIContactSuggestionModalProps> = ({
  isOpen,
  onClose,
  suggestion
}) => {
  // Copy suggestion to clipboard
  const copyToClipboard = () => {
    if (!suggestion) return;
    
    navigator.clipboard.writeText(suggestion)
      .then(() => {
        toast({
          title: "In Zwischenablage kopiert",
          description: "Der KI-Kontaktvorschlag wurde in die Zwischenablage kopiert.",
          variant: "default"
        });
      })
      .catch(() => {
        toast({
          title: "Fehler beim Kopieren",
          description: "Der Text konnte nicht in die Zwischenablage kopiert werden.",
          variant: "destructive"
        });
      });
  };

  // Helper function to format markdown-like text
  const formatSuggestion = (text: string) => {
    // Replace markdown-style headings with HTML
    const withHeadings = text
      .replace(/^###\s*(.*?)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^##\s*(.*?)$/gm, '<h2 class="text-xl font-bold mt-6 mb-2">$1</h2>')
      .replace(/^#\s*(.*?)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>');
    
    // Replace markdown lists with HTML lists
    const withLists = withHeadings
      .replace(/^\d+\.\s*(.*?)$/gm, '<li class="ml-6 list-decimal">$1</li>')
      .replace(/^-\s*(.*?)$/gm, '<li class="ml-6 list-disc">$1</li>');
    
    // Replace double line breaks with paragraphs
    const withParagraphs = withLists
      .replace(/\n\n/g, '</p><p class="my-2">')
      .replace(/<\/p><p class="my-2"><li/g, '</p><li') // Fix list item wrapper
      .replace(/<\/li><p class="my-2">/g, '</li>'); // Fix list item wrapper
    
    return `<p class="my-2">${withParagraphs}</p>`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KI-Kontaktvorschlag</DialogTitle>
          <DialogDescription>
            Basierend auf den Jobangeboten hat unsere KI einen personalisierten Kontaktvorschlag erstellt.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 p-4 bg-muted/50 rounded-lg">
          {suggestion ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formatSuggestion(suggestion) }} 
            />
          ) : (
            <p className="text-muted-foreground">Kein Kontaktvorschlag verfügbar.</p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Schließen</Button>
          {suggestion && (
            <Button onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Kopieren
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIContactSuggestionModal;
