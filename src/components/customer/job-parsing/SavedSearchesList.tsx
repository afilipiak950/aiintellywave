
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trash2 } from 'lucide-react';
import { JobSearchHistory } from '@/types/job-parsing';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SavedSearchesListProps {
  savedSearches: JobSearchHistory[];
  onSelect: (record: JobSearchHistory) => void;
  onDelete: (id: string) => void;
  maxHeight?: string;
}

const SavedSearchesList: React.FC<SavedSearchesListProps> = ({
  savedSearches,
  onSelect,
  onDelete,
  maxHeight = '400px'
}) => {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  
  // Format date relative to now
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: de
      });
    } catch (e) {
      return 'Kürzlich';
    }
  };
  
  // Confirm and handle delete
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };
  
  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };
  
  const cancelDelete = () => {
    setDeleteId(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gespeicherte Suchen</CardTitle>
          <CardDescription>
            Ihre kürzlich gespeicherten Jobsuchen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea style={{ maxHeight }} className="pr-4">
            {savedSearches.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>Keine gespeicherten Suchen</p>
                <p className="text-sm mt-2">Speichern Sie eine Suche, um sie hier anzuzeigen.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedSearches.slice(0, 10).map((search) => (
                  <div
                    key={search.id}
                    className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors group relative"
                    onClick={() => onSelect(search)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium truncate">{search.search_query}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                        onClick={(e) => handleDelete(search.id, e)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Löschen</span>
                      </Button>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground mb-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(search.created_at)}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {search.search_results?.length || 0} Jobangebote
                      {search.search_location && ` in ${search.search_location}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gespeicherte Suche löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese gespeicherte Suche wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SavedSearchesList;
