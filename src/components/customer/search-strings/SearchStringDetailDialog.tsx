
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface SearchStringDetailDialogProps {
  searchString: SearchString;
  open: boolean;
  onClose: () => void;
}

const SearchStringDetailDialog: React.FC<SearchStringDetailDialogProps> = ({
  searchString,
  open,
  onClose
}) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert!",
      description: "Der Text wurde in die Zwischenablage kopiert.",
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('de-DE')} (${formatDistanceToNow(date, { locale: de, addSuffix: true })})`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Search String Details</span>
            <Badge
              className={
                searchString.status === 'completed' ? 'bg-green-500' : 
                searchString.status === 'processing' ? 'bg-blue-500' : 
                searchString.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
              }
            >
              {searchString.status === 'completed' ? 'Abgeschlossen' : 
               searchString.status === 'processing' ? 'Wird bearbeitet' : 
               searchString.status === 'failed' ? 'Fehler' : 'Neu'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm mb-6">
          <div><strong>Typ:</strong> {searchString.type === 'recruiting' ? 'Recruiting' : 'Lead Generation'}</div>
          <div><strong>Erstellt:</strong> {formatDate(searchString.created_at)}</div>
          {searchString.processed_at && <div><strong>Verarbeitet:</strong> {formatDate(searchString.processed_at)}</div>}
        </div>

        <Tabs defaultValue="result">
          <TabsList className="w-full">
            <TabsTrigger value="result">Ergebnis</TabsTrigger>
            <TabsTrigger value="input">Eingabe</TabsTrigger>
            {searchString.error && <TabsTrigger value="error">Fehler</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="result" className="p-4 bg-gray-50 rounded-md">
            {searchString.generated_string ? (
              <div className="space-y-4">
                <div className="whitespace-pre-wrap">{searchString.generated_string}</div>
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(searchString.generated_string || '')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  In Zwischenablage kopieren
                </Button>
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Noch keine Suchanfrage generiert. Die Verarbeitung könnte noch laufen.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="input" className="space-y-4">
            <div>
              <div className="font-semibold mb-2">Eingabequelle:</div>
              <div>{searchString.input_source === 'text' ? 'Text' : 'Webseite'}</div>
            </div>
            
            {searchString.input_source === 'text' && searchString.input_text && (
              <div>
                <div className="font-semibold mb-2">Eingabetext:</div>
                <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {searchString.input_text}
                </div>
              </div>
            )}
            
            {searchString.input_source === 'website' && searchString.input_url && (
              <div>
                <div className="font-semibold mb-2">Eingabe-URL:</div>
                <a 
                  href={searchString.input_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center"
                >
                  {searchString.input_url}
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            )}
          </TabsContent>
          
          {searchString.error && (
            <TabsContent value="error" className="p-4 bg-red-50 rounded-md">
              <div className="font-semibold text-red-600 mb-2">Fehler bei der Verarbeitung:</div>
              <div className="text-red-600">{searchString.error}</div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SearchStringDetailDialog;
