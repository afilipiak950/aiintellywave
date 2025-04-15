
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bookmark, Clock, MapPin, Search, RotateCw, X } from 'lucide-react';
import { JobSearchHistory } from '@/types/job-parsing';

interface SavedSearchesListProps {
  savedSearches: JobSearchHistory[];
  onSelect: (recordId: string) => void;
  onDelete: (recordId: string) => void;
  className?: string;
  maxHeight?: string;
}

const SavedSearchesList: React.FC<SavedSearchesListProps> = ({
  savedSearches,
  onSelect,
  onDelete,
  className = '',
  maxHeight = '300px'
}) => {
  if (!savedSearches || savedSearches.length === 0) {
    return (
      <Card className={`mt-6 ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Bookmark className="h-5 w-5 mr-2" />
            Gespeicherte Suchen
          </CardTitle>
          <CardDescription>Speichern Sie Ihre Suchen, um sie später wieder aufzurufen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Keine gespeicherten Suchen vorhanden</p>
            <p className="text-xs text-muted-foreground mt-2">
              Drücken Sie auf "Suche speichern" nach einer Suche, um sie hier zu speichern
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mt-6 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Bookmark className="h-5 w-5 mr-2" />
          Gespeicherte Suchen
        </CardTitle>
        <CardDescription>Ihre gespeicherten Jobsuchen</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`pr-4 -mr-4`} style={{ maxHeight }}>
          <div className="space-y-3">
            {savedSearches.map((search) => (
              <div 
                key={search.id} 
                className="border rounded-md p-3 hover:bg-muted/50 relative group"
              >
                <div className="flex justify-between items-start">
                  <div 
                    className="cursor-pointer flex-1"
                    onClick={() => onSelect(search.id)}
                  >
                    <h4 className="font-medium text-sm">{search.search_query}</h4>
                    
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      {search.search_location && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{search.search_location}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(search.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 -m-2"
                    onClick={() => onDelete(search.id)}
                    aria-label="Suche löschen"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 mr-2"
                    onClick={() => onSelect(search.id)}
                  >
                    <RotateCw className="h-3 w-3 mr-1" />
                    Suche aufrufen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SavedSearchesList;
