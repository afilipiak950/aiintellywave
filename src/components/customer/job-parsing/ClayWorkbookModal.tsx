
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ClayWorkbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  workbookUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const ClayWorkbookModal: React.FC<ClayWorkbookModalProps> = ({
  isOpen,
  onClose,
  workbookUrl,
  isLoading,
  error
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  const handleCopyLink = () => {
    if (!workbookUrl) return;
    
    navigator.clipboard.writeText(workbookUrl)
      .then(() => {
        toast({
          title: "Link kopiert",
          description: "Der Clay Workbook-Link wurde in die Zwischenablage kopiert",
          variant: "default"
        });
      })
      .catch(() => {
        toast({
          title: "Fehler beim Kopieren",
          description: "Der Link konnte nicht kopiert werden",
          variant: "destructive"
        });
      });
  };
  
  const handleExternalOpen = () => {
    if (!workbookUrl) return;
    window.open(workbookUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Clay Kontaktvorschlag</DialogTitle>
          <DialogDescription>
            Kontaktvorschläge basierend auf Ihrer Jobsuche
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-[400px] relative overflow-hidden px-6">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Kontaktvorschläge werden geladen...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-4 max-w-md text-center">
                <div className="p-3 rounded-full bg-destructive/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-destructive"
                  >
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-destructive">Fehler beim Laden der Kontaktvorschläge</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}
          
          {!isLoading && !error && workbookUrl && (
            <>
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-5">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              <iframe
                src={workbookUrl}
                className="w-full h-[60vh] border-0"
                onLoad={() => setIframeLoaded(true)}
                title="Clay Workbook"
                allow="clipboard-write"
              />
            </>
          )}
        </div>
        
        <DialogFooter className="p-6 pt-2 flex flex-col sm:flex-row gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Schließen</Button>
          
          {workbookUrl && (
            <>
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Link kopieren
              </Button>
              <Button onClick={handleExternalOpen}>
                <ExternalLink className="mr-2 h-4 w-4" />
                In neuem Tab öffnen
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClayWorkbookModal;
