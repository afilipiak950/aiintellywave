
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JobSearchHistory } from '@/types/job-parsing';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, Trash2 } from 'lucide-react';

interface SavedSearchesTableProps {
  savedSearches: JobSearchHistory[];
  onSelect: (record: JobSearchHistory) => void;
  onDelete: (id: string) => void;
}

const SavedSearchesTable: React.FC<SavedSearchesTableProps> = ({
  savedSearches,
  onSelect,
  onDelete
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
      return 'Kürzlich';
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Alle gespeicherten Suchen</CardTitle>
        <CardDescription>
          Übersicht aller Ihrer gespeicherten Jobsuchen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {savedSearches.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Keine gespeicherten Suchen vorhanden</p>
            <p className="text-sm mt-2">Speichern Sie eine Suche, um sie hier anzuzeigen.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suchbegriff</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Ergebnisse</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedSearches.map((search) => (
                <TableRow key={search.id}>
                  <TableCell className="font-medium">{search.search_query}</TableCell>
                  <TableCell>{search.search_location || '-'}</TableCell>
                  <TableCell>{formatDate(search.created_at)}</TableCell>
                  <TableCell>{search.search_results?.length || 0} Jobs</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSelect(search)}
                      title="Suche laden"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(search.id)}
                      title="Suche löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedSearchesTable;
