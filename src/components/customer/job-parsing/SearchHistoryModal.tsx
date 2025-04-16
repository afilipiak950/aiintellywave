
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Search } from 'lucide-react';
import { JobSearchHistory } from '@/types/job-parsing';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface SearchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchHistory: JobSearchHistory[];
  onSelectRecord: (record: JobSearchHistory) => void;
}

const SearchHistoryModal: React.FC<SearchHistoryModalProps> = ({
  isOpen,
  onClose,
  searchHistory,
  onSelectRecord
}) => {
  // Format date relative to now
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: de
      });
    } catch (e) {
      return 'Unbekanntes Datum';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Gespeicherte Suchen</DialogTitle>
          <DialogDescription>
            Wählen Sie eine gespeicherte Suche aus, um die Ergebnisse zu laden.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[50vh] pr-4">
          {searchHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Keine gespeicherten Suchen</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Speichern Sie eine Suche, um sie später wiederzufinden.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchHistory.map((record) => (
                <div 
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    onSelectRecord(record);
                    onClose();
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">"{record.search_query}"</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(record.created_at)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {record.search_location && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                        Ort: {record.search_location}
                      </span>
                    )}
                    {record.search_experience && record.search_experience !== 'any' && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                        Erfahrung: {record.search_experience}
                      </span>
                    )}
                    {record.search_industry && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                        Branche: {record.search_industry}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {record.search_results?.length || 0} Jobangebote gefunden
                  </div>
                  
                  {record.ai_contact_suggestion && (
                    <div className="mt-2 text-xs text-green-600 flex items-center">
                      <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                      KI-Kontaktvorschlag verfügbar
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Schließen</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchHistoryModal;
