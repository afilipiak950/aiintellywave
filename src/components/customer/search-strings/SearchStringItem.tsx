
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { SearchString } from '@/hooks/search-strings/search-string-types';

interface SearchStringItemProps {
  searchString: SearchString;
  onOpenDetail: (searchString: SearchString) => void;
}

const SearchStringItem: React.FC<SearchStringItemProps> = ({ 
  searchString, 
  onOpenDetail 
}) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: de 
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {searchString.type === 'recruiting' ? 'Recruiting' : 'Lead Generation'}
          </CardTitle>
          <Badge className={getStatusColor(searchString.status)}>
            {searchString.status === 'completed' ? 'Abgeschlossen' : 
             searchString.status === 'processing' ? 'Wird bearbeitet' : 
             searchString.status === 'error' ? 'Fehler' : 'Neu'}
          </Badge>
        </div>
        <div className="text-sm text-gray-500">
          Erstellt {formatDate(searchString.created_at)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          {searchString.generated_string ? (
            <div className="p-3 bg-gray-100 rounded-md text-sm">
              <div className="font-semibold mb-1">Generierte Suchanfrage:</div>
              <div className="line-clamp-3">{searchString.generated_string}</div>
            </div>
          ) : (
            <div className="p-3 bg-gray-100 rounded-md text-sm">
              <div className="font-semibold mb-1">Eingabe:</div>
              <div className="line-clamp-3">
                {searchString.input_source === 'text' 
                  ? searchString.input_text 
                  : searchString.input_url || 'Keine Eingabe vorhanden'}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onOpenDetail(searchString)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Details ansehen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchStringItem;
