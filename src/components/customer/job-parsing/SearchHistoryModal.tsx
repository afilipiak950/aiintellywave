
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { JobOfferRecord } from '@/types/job-parsing';

interface SearchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchHistory: JobOfferRecord[];
  onSelectRecord: (record: JobOfferRecord) => void;
}

const SearchHistoryModal: React.FC<SearchHistoryModalProps> = ({
  isOpen,
  onClose,
  searchHistory,
  onSelectRecord
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Suchverlauf</CardTitle>
          <CardDescription>
            Frühere Suchanfragen und Ergebnisse
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto">
          {searchHistory.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Keine Suchhistorie vorhanden</p>
          ) : (
            <div className="space-y-4">
              {searchHistory.map((record) => (
                <div 
                  key={record.id} 
                  className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => onSelectRecord(record)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{record.search_query}</h4>
                    <Badge variant="outline">{record.search_results?.length || 0} Jobs</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {record.search_location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{record.search_location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {new Date(record.created_at).toLocaleDateString()} um{' '}
                        {new Date(record.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onClose}>
            Schließen
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SearchHistoryModal;
