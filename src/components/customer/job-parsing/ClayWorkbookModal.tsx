
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Clay Workbook</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Workbook wird erstellt...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-4 rounded-md">
              <p className="font-medium text-destructive">Fehler</p>
              <p className="text-muted-foreground mt-1">{error}</p>
            </div>
          ) : workbookUrl ? (
            <div className="space-y-4">
              <p>
                Ihr Clay Workbook wurde erfolgreich erstellt. Klicken Sie auf den Button unten, um es in einem neuen Tab zu öffnen.
              </p>
              
              <div className="flex justify-center">
                <Button
                  onClick={() => window.open(workbookUrl, '_blank', 'noopener,noreferrer')}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Clay Workbook öffnen
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              Kein Workbook verfügbar
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClayWorkbookModal;
