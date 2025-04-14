
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, Search, Eye, Copy, Check, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SearchStringDetailDialog from '../../customer/search-strings/SearchStringDetailDialog';
import { supabase } from '@/integrations/supabase/client';

interface SearchStringsListProps {}

const AdminSearchStringsList: React.FC<SearchStringsListProps> = () => {
  const { toast } = useToast();
  const [searchStrings, setSearchStrings] = useState<SearchString[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSearchString, setSelectedSearchString] = useState<SearchString | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});

  // Function to fetch all search strings (not just for the current user)
  const fetchAllSearchStrings = async () => {
    try {
      setIsRefreshing(true);
      
      // Fetch all search strings without any filters to ensure we get everything
      const { data, error } = await supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all search strings:', error);
        toast({
          title: 'Failed to load search strings',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Admin: Fetched search strings:', data?.length);
      setSearchStrings(data || []);
      
      // Get all unique user IDs
      const userIds = [...new Set(data?.map(item => item.user_id) || [])];
      
      // Fetch user emails for those IDs
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('company_users')
          .select('user_id, email')
          .in('user_id', userIds);
          
        if (!userError && userData) {
          const emailMap: Record<string, string> = {};
          userData.forEach(user => {
            emailMap[user.user_id] = user.email;
          });
          setUserEmails(emailMap);
        } else {
          console.error('Error fetching user emails:', userError);
        }
      }
    } catch (error) {
      console.error('Error in fetchAllSearchStrings:', error);
      toast({
        title: 'Error loading search strings',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllSearchStrings();
  }, []);

  // Load company names when search strings change
  useEffect(() => {
    const loadCompanyNames = async () => {
      if (!searchStrings || searchStrings.length === 0) return;
      
      // Filter out search strings without company_id
      const stringWithCompanyIds = searchStrings.filter(item => item.company_id);
      if (stringWithCompanyIds.length === 0) return;
      
      const uniqueCompanyIds = [...new Set(stringWithCompanyIds.map(item => item.company_id))];
      
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', uniqueCompanyIds);
      
      if (error) {
        console.error('Error fetching company names:', error);
        return;
      }
      
      if (data) {
        const companyMap: Record<string, string> = {};
        data.forEach(company => {
          companyMap[company.id] = company.name;
        });
        setCompanyNames(companyMap);
      }
    };
    
    loadCompanyNames();
  }, [searchStrings]);

  // Mark a search string as processed
  const markAsProcessed = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('search_strings')
        .update({ 
          is_processed: true, 
          processed_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error marking search string as processed:', error);
        toast({
          title: 'Failed to update',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      // Update the local state
      setSearchStrings(prev => 
        prev.map(item => 
          item.id === id ? { ...item, is_processed: true, processed_at: new Date().toISOString() } : item
        )
      );
      
      toast({
        title: 'Marked as processed',
        description: 'Search string has been marked as processed',
      });
    } catch (error) {
      console.error('Error in markAsProcessed:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Copy search string to clipboard
  const handleCopySearchString = (searchString: string) => {
    navigator.clipboard.writeText(searchString);
    toast({
      title: 'Copied to clipboard',
      description: 'Search string has been copied to your clipboard',
    });
  };

  // View search string details
  const handleViewDetails = (searchString: SearchString) => {
    setSelectedSearchString(searchString);
    setIsDetailOpen(true);
  };

  // Create a new project from a search string
  const handleCreateProject = async (searchString: SearchString, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/admin/projects/new?search_string_id=${searchString.id}`;
  };

  // Get badge for search string status
  const getStatusBadge = (status: string, isProcessed?: boolean) => {
    if (isProcessed) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Processed</Badge>;
    }
    
    switch (status) {
      case 'new':
        return <Badge variant="outline">New</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get label for search string type
  const getTypeLabel = (type: string) => {
    return type === 'recruiting' ? 'Recruiting' : 'Lead Generation';
  };

  // Filter search strings based on search term
  const filteredSearchStrings = searchStrings?.filter(item => {
    if (!searchTerm) return true;
    
    const companyName = item.company_id ? (companyNames[item.company_id] || '') : '';
    const userEmail = userEmails[item.user_id] || '';
    const searchLower = searchTerm.toLowerCase();
    
    return (
      companyName.toLowerCase().includes(searchLower) ||
      userEmail.toLowerCase().includes(searchLower) ||
      getTypeLabel(item.type).toLowerCase().includes(searchLower) ||
      (item.input_text && item.input_text.toLowerCase().includes(searchLower)) ||
      (item.generated_string && item.generated_string.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Strings</CardTitle>
          <CardDescription>Manage customer-generated search strings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Search Strings</CardTitle>
          <CardDescription>Manage search strings created by customers</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAllSearchStrings}
          className="flex items-center gap-1"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company, email, type or content..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredSearchStrings && filteredSearchStrings.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSearchStrings.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleViewDetails(item)}
                  >
                    <TableCell>{userEmails[item.user_id] || item.user_id.substring(0, 8)}</TableCell>
                    <TableCell>{item.company_id ? (companyNames[item.company_id] || 'Loading...') : 'N/A'}</TableCell>
                    <TableCell>{getTypeLabel(item.type)}</TableCell>
                    <TableCell>{getStatusBadge(item.status, item.is_processed)}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(item);
                        }}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                        
                        {item.generated_string && (
                          <Button variant="ghost" size="icon" onClick={(e) => {
                            e.stopPropagation();
                            handleCopySearchString(item.generated_string || '');
                          }}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy search string</span>
                          </Button>
                        )}
                        
                        {item.status === 'completed' && !item.is_processed && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => markAsProcessed(item.id, e)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Mark as processed</span>
                          </Button>
                        )}
                        
                        {item.status === 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleCreateProject(item, e)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                          >
                            <Folder className="h-4 w-4" />
                            <span className="sr-only">Create project</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">No search strings found</h3>
            <p className="text-muted-foreground mt-2">
              {searchTerm 
                ? `No search strings match your search: "${searchTerm}"` 
                : "No search strings have been created yet by any customers"}
            </p>
          </div>
        )}
      </CardContent>
      
      {selectedSearchString && (
        <SearchStringDetailDialog
          searchString={selectedSearchString}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </Card>
  );
};

export default AdminSearchStringsList;
