
import React, { useState } from 'react';
import { usePublicSearchStrings } from './hooks/usePublicSearchStrings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, ArrowUpDown, Search, Database } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

const PublicSearchStringsList: React.FC = () => {
  const { searchStrings, isLoading, isRefreshing, error, totalCount, refresh } = usePublicSearchStrings();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    
    refresh({
      sortField: field,
      sortDirection: sortField === field && sortDirection === 'desc' ? 'asc' : 'desc'
    });
  };
  
  const handleRefresh = () => {
    refresh({ sortField, sortDirection });
  };

  // Filter search strings based on search term
  const filteredSearchStrings = searchStrings.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (item.type && item.type.toLowerCase().includes(searchLower)) ||
      (item.status && item.status.toLowerCase().includes(searchLower)) ||
      (item.input_text && item.input_text.toLowerCase().includes(searchLower)) ||
      (item.generated_string && item.generated_string.toLowerCase().includes(searchLower)) ||
      (item.input_url && item.input_url.toLowerCase().includes(searchLower)) ||
      (item.user_id && item.user_id.toLowerCase().includes(searchLower)) ||
      (item.company_id && item.company_id.toLowerCase().includes(searchLower)) ||
      (item.id && item.id.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="animate-spin h-8 w-8 mb-4 text-primary" />
          <p>Loading search strings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 w-full flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search strings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
            // Fix: Use proper icon implementation instead of passing an Element as a string
            className="max-w-xs pl-9"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="bg-muted/40 rounded-lg px-3 py-1 text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>Total: {totalCount} strings</span> 
          {filteredSearchStrings.length !== totalCount && (
            <span className="text-muted-foreground">
              (Showing {filteredSearchStrings.length} filtered)
            </span>
          )}
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error loading search strings</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!error && searchStrings.length === 0 && (
        <Alert className="mb-6">
          <AlertTitle>No search strings found</AlertTitle>
          <AlertDescription>
            The database query returned no results. This could mean the table is empty.
          </AlertDescription>
        </Alert>
      )}
      
      {!error && searchStrings.length > 0 && filteredSearchStrings.length === 0 && (
        <Alert className="mb-6">
          <AlertTitle>No matching search strings</AlertTitle>
          <AlertDescription>
            No search strings match your filter criteria. Try adjusting your search term.
            <Button 
              variant="link" 
              onClick={() => setSearchTerm('')}
              className="p-0 h-auto text-sm"
            >
              Clear filter
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {filteredSearchStrings.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[70vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px] sticky top-0 bg-white">
                      <Button variant="ghost" onClick={() => handleSort('id')} className="p-0 h-auto font-medium flex items-center">
                        ID <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[100px] sticky top-0 bg-white">
                      <Button variant="ghost" onClick={() => handleSort('type')} className="p-0 h-auto font-medium flex items-center">
                        Type <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[120px] sticky top-0 bg-white">
                      <Button variant="ghost" onClick={() => handleSort('status')} className="p-0 h-auto font-medium flex items-center">
                        Status <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[200px] sticky top-0 bg-white">User ID</TableHead>
                    <TableHead className="min-w-[200px] sticky top-0 bg-white">Company ID</TableHead>
                    <TableHead className="min-w-[300px] sticky top-0 bg-white">Generated String</TableHead>
                    <TableHead className="min-w-[180px] sticky top-0 bg-white">
                      <Button variant="ghost" onClick={() => handleSort('created_at')} className="p-0 h-auto font-medium flex items-center">
                        Created At <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSearchStrings.map((string) => (
                    <TableRow key={string.id}>
                      <TableCell className="font-mono text-xs">{string.id}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {string.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${string.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            string.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                            string.status === 'failed' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {string.status}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{string.user_id}</TableCell>
                      <TableCell className="font-mono text-xs">{string.company_id || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {string.generated_string || string.input_text || string.input_url || '-'}
                      </TableCell>
                      <TableCell>{new Date(string.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicSearchStringsList;
