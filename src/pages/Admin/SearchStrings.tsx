
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Search String type definition
// Using the type from hooks/search-strings/search-string-types
import { SearchString } from '@/hooks/search-strings/search-string-types';

// If needed, define SUPABASE_ID for external links
const SUPABASE_ID = 'ootziscicbahucatxyme';

const SearchStringsPage: React.FC = () => {
  // State for search strings data
  const [searchStrings, setSearchStrings] = useState<SearchString[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [filter, setFilter] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Fetch search strings from Supabase using SDK
  const fetchSearchStrings = async () => {
    setStatus('loading');
    try {
      console.log('Fetching search strings from Supabase...');
      
      // First try to use the edge function to bypass RLS
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke('get-all-search-strings', {
          method: 'GET'
        });
        
        if (functionError) {
          console.error('Error calling edge function:', functionError);
          throw new Error(`Edge function error: ${functionError.message}`);
        }
        
        if (functionData && functionData.data) {
          console.log(`Successfully fetched ${functionData.data.length} search strings via edge function`);
          setSearchStrings(functionData.data);
          setStatus('ready');
          return;
        }
      } catch (edgeFunctionError) {
        console.error('Edge function approach failed, falling back to direct query:', edgeFunctionError);
      }
      
      // Fallback to direct query if edge function fails
      const { data, error } = await supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching search strings from Supabase:', error);
        setErrorMessage(`Database error: ${error.message}`);
        setStatus('error');
        return;
      }

      setSearchStrings(data || []);
      setStatus('ready');
      console.log(`Loaded ${data?.length || 0} search strings`);
    } catch (err: any) {
      console.error('Unexpected error fetching search strings:', err);
      setErrorMessage(err.message || 'An unexpected error occurred');
      setStatus('error');
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSearchStrings();
  }, []);

  // Filter search strings based on filter term
  const filteredStrings = searchStrings.filter(item => {
    if (!filter) return true;
    const filterLower = filter.toLowerCase();
    return (
      (item.input_text && item.input_text.toLowerCase().includes(filterLower)) ||
      (item.generated_string && item.generated_string.toLowerCase().includes(filterLower)) ||
      (item.input_url && item.input_url.toLowerCase().includes(filterLower)) ||
      (item.type && item.type.toLowerCase().includes(filterLower)) ||
      (item.status && item.status.toLowerCase().includes(filterLower))
    );
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
    } catch (e) {
      return dateString;
    }
  };
  
  // Generate Supabase console URL for a search string
  const getSupabaseConsoleUrl = (id: string) => {
    return `https://console.supabase.com/project/${SUPABASE_ID}/table/search_strings?id=${id}`;
  };

  // Skeleton loader for cards
  const SkeletonCard = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-1/4" />
      </CardFooter>
    </Card>
  );

  // Render skeleton cards during loading
  const renderSkeletonCards = () => {
    return Array(3).fill(0).map((_, index) => (
      <SkeletonCard key={`skeleton-${index}`} />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Search Strings</h1>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500">Total in DB: {searchStrings.length}</Badge>
            <Button
              onClick={fetchSearchStrings}
              disabled={status === 'loading'}
              size="sm"
              variant="outline"
            >
              {status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Database Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{errorMessage || 'Failed to load search strings.'}</span>
              <Button
                onClick={fetchSearchStrings}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filter Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Filter search strings..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Search Strings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {status === 'loading' ? (
            renderSkeletonCards()
          ) : filteredStrings.length > 0 ? (
            filteredStrings.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>{item.type || 'Search String'}</span>
                    <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                      {item.status || 'unknown'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="max-h-40 overflow-auto text-sm mb-2">
                    {item.generated_string || item.input_text || item.input_url || 'No content'}
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>Created: {formatDate(item.created_at)}</p>
                    {item.user_id && <p>User ID: {item.user_id.slice(0, 8)}...</p>}
                    {item.company_id && <p>Company ID: {item.company_id.slice(0, 8)}...</p>}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between items-center text-xs text-gray-500">
                  <span>ID: {item.id.slice(0, 8)}...</span>
                  <a 
                    href={getSupabaseConsoleUrl(item.id)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    Open in Supabase <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center h-40">
              <p className="text-gray-500">No search strings found matching your filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchStringsPage;
