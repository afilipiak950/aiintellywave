
import React, { useEffect } from 'react';
import { useSearchStringCore } from '@/hooks/search-strings/use-search-string-core';
import { useSearchStringOperations } from '@/hooks/search-strings/use-search-string-operations';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface SearchStringsListProps {
  onError?: (error: string | null) => void;
}

const SearchStringsList: React.FC<SearchStringsListProps> = ({ onError }) => {
  const { searchStrings, isLoading, error, fetchSearchStrings, user } = useSearchStringCore();
  const { deleteSearchString } = useSearchStringOperations({ user, fetchSearchStrings });
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useEffect(() => {
    if (error && onError) {
      onError(error.message || 'Fehler beim Laden der Search Strings');
    }
  }, [error, onError]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchSearchStrings();
      toast({
        title: "Aktualisiert",
        description: "Die Search Strings wurden aktualisiert.",
      });
    } catch (err) {
      console.error('Fehler beim Aktualisieren:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Möchten Sie diesen Search String wirklich löschen?")) {
      await deleteSearchString(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription>
          <div>{error.message || 'Fehler beim Laden der Search Strings'}</div>
          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Erneut versuchen'
              )}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!searchStrings || searchStrings.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <h3 className="font-medium text-gray-700 mb-2">Noch keine Search Strings</h3>
        <p className="text-gray-500">Erstellen Sie oben Ihren ersten Search String.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">{searchStrings.length} Search Strings gefunden</span>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      <div className="space-y-4">
        {searchStrings.map((searchString) => (
          <div 
            key={searchString.id} 
            className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {searchString.type === 'recruiting' ? 'Recruiting' : 'Lead Generation'}
                </span>
                <span className="ml-2 inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                  {searchString.status}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 text-xs"
                onClick={() => handleDelete(searchString.id)}
              >
                Löschen
              </Button>
            </div>
            
            <div className="mt-2">
              {searchString.input_source === 'text' && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Eingabe: </span>
                  {searchString.input_text && searchString.input_text.length > 100 
                    ? `${searchString.input_text.substring(0, 100)}...` 
                    : searchString.input_text}
                </div>
              )}
              
              {searchString.input_source === 'website' && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">URL: </span>
                  <a 
                    href={searchString.input_url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {searchString.input_url}
                  </a>
                </div>
              )}
              
              {searchString.input_source === 'pdf' && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">PDF: </span>
                  {searchString.input_pdf_path && searchString.input_pdf_path.split('/').pop()}
                </div>
              )}
            </div>
            
            {searchString.generated_string && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <div className="font-medium text-sm mb-1">Generierter Search String:</div>
                <div className="text-sm font-mono whitespace-pre-wrap overflow-auto max-h-32">
                  {searchString.generated_string}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(searchString.generated_string || '');
                    toast({
                      title: "Kopiert",
                      description: "Search String wurde in die Zwischenablage kopiert."
                    });
                  }}
                >
                  In Zwischenablage kopieren
                </Button>
              </div>
            )}
            
            <div className="mt-2 text-xs text-gray-500">
              Erstellt: {new Date(searchString.created_at).toLocaleString('de-DE')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchStringsList;
