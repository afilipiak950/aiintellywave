
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  Loader2,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

// Search String type definition
interface SearchString {
  id: string;
  user_id: string;
  company_id?: string;
  type: 'recruiting' | 'lead_generation';
  input_source: 'text' | 'url' | 'pdf';
  input_text?: string;
  input_url?: string;
  input_pdf_path?: string;
  generated_string?: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_processed: boolean;
  processed_at?: string;
  processed_by?: string;
  error?: string;
  progress?: number;
}

const SearchStringsPage: React.FC = () => {
  // State for search strings data
  const [searchStrings, setSearchStrings] = useState<SearchString[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  // State for filters and pagination
  const [filter, setFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  
  // Define Supabase Edge Function URL
  const fetchSearchStringsUrl = `https://ootziscicbahucatxyme.supabase.co/functions/v1/admin-search-strings`;

  // Function to fetch search strings
  const fetchSearchStrings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus('checking');
    
    try {
      // Calculate offset based on page number and page size
      const offset = (page - 1) * pageSize;
      
      // Build URL with query parameters
      const queryParams = new URLSearchParams({
        filter,
        sortField,
        sortDirection,
        limit: pageSize.toString(),
        offset: offset.toString()
      });
      
      const url = `${fetchSearchStringsUrl}?${queryParams}`;
      console.log(`Fetching search strings from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log(`Fetched ${data.data.length} search strings out of ${data.totalCount} total`);
      setSearchStrings(data.data || []);
      setTotalCount(data.totalCount || 0);
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Error fetching search strings:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [filter, page, pageSize, sortDirection, sortField]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchSearchStrings();
  }, [fetchSearchStrings]);

  // Handle sort column click
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <SortAsc className="h-4 w-4 ml-1" /> 
      : <SortDesc className="h-4 w-4 ml-1" />;
  };

  // Handle pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Search Strings Administration</h1>
          <Button
            onClick={() => fetchSearchStrings()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh Data
          </Button>
        </div>

        {/* Connection Status */}
        {connectionStatus === 'checking' && (
          <Alert className="bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Connecting to Database</AlertTitle>
            <AlertDescription>Establishing connection to fetch search strings...</AlertDescription>
          </Alert>
        )}
        
        {connectionStatus === 'connected' && totalCount > 0 && (
          <Alert className="bg-green-50">
            <Database className="h-4 w-4" />
            <AlertTitle>Database Connected</AlertTitle>
            <AlertDescription>Found {totalCount} search strings in the database.</AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <span>{error}</span>
              <Button
                onClick={() => fetchSearchStrings()}
                variant="outline"
                size="sm"
                className="self-start flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filter Input */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Filter by search string or URL..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="secondary" onClick={() => setFilter('')}>
            Clear
          </Button>
        </div>

        {/* Results Count Display */}
        <div className="text-sm text-gray-500">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading search strings...
            </span>
          ) : (
            <span>
              Showing {searchStrings.length} of {totalCount} total search strings
            </span>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && searchStrings.length === 0 && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Database className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No Search Strings Found</h3>
              <p className="text-gray-500 mb-4">
                {filter ? 'No search strings match your filter criteria.' : 'There are no search strings in the database.'}
              </p>
              <Button onClick={() => fetchSearchStrings()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search Strings Table */}
        {!isLoading && searchStrings.length > 0 && (
          <Card>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center">
                        ID {renderSortIndicator('id')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('user_id')}
                    >
                      <div className="flex items-center">
                        User ID {renderSortIndicator('user_id')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('company_id')}
                    >
                      <div className="flex items-center">
                        Company ID {renderSortIndicator('company_id')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center">
                        Type {renderSortIndicator('type')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status {renderSortIndicator('status')}
                      </div>
                    </TableHead>
                    <TableHead>Search String</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Created At {renderSortIndicator('created_at')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchStrings.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-xs">{item.user_id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-xs">{item.company_id ? item.company_id.slice(0, 8) + '...' : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={item.type === 'recruiting' ? 'default' : 'secondary'}>
                          {item.type === 'recruiting' ? 'Recruiting' : 'Lead Gen'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === 'completed' ? 'default' : 
                            item.status === 'processing' ? 'secondary' :
                            item.status === 'error' ? 'destructive' : 'outline'
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {item.generated_string || item.input_text || item.input_url || 'No content'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={page === 1}
                >
                  First
                </Button>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => goToPage(page - 1)}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.min(
                  Math.max(page - 2, 1) + i,
                  totalPages
                );
                
                // Skip if we've gone past the total pages
                if (pageNumber > totalPages) return null;
                
                // Skip some numbers and show ellipsis for large ranges
                if (
                  totalPages > 7 &&
                  (pageNumber === 2 && page > 4 || 
                   pageNumber === totalPages - 1 && page < totalPages - 3)
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${pageNumber}`}>
                      <span className="px-4 py-2">...</span>
                    </PaginationItem>
                  );
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink 
                      isActive={pageNumber === page}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => goToPage(page + 1)}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              <PaginationItem>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={page === totalPages}
                >
                  Last
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default SearchStringsPage;
