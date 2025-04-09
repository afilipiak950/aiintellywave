import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabaseRaw as supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, 
  Search, 
  AlertCircle, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  Filter, 
  FileText
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';

interface Workflow {
  id: string;
  workflow_id: string;
  workflow_name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  tags: string[];
  metrics: any;
}

interface ApiLog {
  id: string;
  timestamp: string;
  endpoint: string;
  status: number;
  error_message: string | null;
  duration_ms: number;
}

interface ConfigData {
  id: string;
  api_url: string;
  api_key: string;
  last_updated: string;
}

const PAGE_SIZES = [10, 25, 50, 100];

const InstantlyDashboard: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Pagination & search state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<string>('workflows');
  
  // Fetch workflows data
  const { 
    data: workflowsData, 
    isLoading: isLoadingWorkflows, 
    error: workflowsError,
    refetch: refetchWorkflows
  } = useQuery({
    queryKey: ['instantly-workflows', currentPage, pageSize, searchTerm, sortField, sortDirection],
    queryFn: async () => {
      try {
        // Fetch from Supabase
        // We use the raw client with type assertion to allow custom schema queries
        let query = supabase
          .from('instantly_integration.workflows' as any)
          .select('*', { count: 'exact' } as any);

        // Apply search filter if provided
        if (searchTerm) {
          query = query.or(
            `workflow_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
          );
        }
        
        // Apply sorting
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
        
        // Apply pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        return {
          workflows: data as unknown as Workflow[],
          totalCount: count || 0
        };
      } catch (error) {
        console.error("Error fetching workflows:", error);
        throw error;
      }
    }
  });
  
  // Fetch API logs
  const {
    data: logsData,
    isLoading: isLoadingLogs,
    error: logsError,
    refetch: refetchLogs
  } = useQuery({
    queryKey: ['instantly-logs', currentPage, pageSize],
    queryFn: async () => {
      // Fetch from Supabase
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from('instantly_integration.logs' as any)
        .select('*', { count: 'exact' } as any)
        .order('timestamp', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      return {
        logs: data as unknown as ApiLog[],
        totalCount: count || 0
      };
    },
    enabled: activeTab === 'logs'
  });
  
  // Fetch last sync timestamp
  const { data: configData } = useQuery({
    queryKey: ['instantly-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instantly_integration.config' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      
      return data as unknown as ConfigData;
    }
  });
  
  // Sync workflows mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!sessionData?.session) {
        throw new Error('You need to be logged in to sync workflows');
      }
      
      // Get access token from session
      const accessToken = sessionData.session.access_token;
      
      const response = await supabase.functions.invoke('instantly-api', {
        body: { action: 'sync_workflows' },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to sync workflows');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Workflows synced successfully',
        description: `Inserted: ${data.inserted}, Updated: ${data.updated}, Errors: ${data.errors}`,
      });
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['instantly-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['instantly-config'] });
      
      // If we're on the logs tab, refresh the logs as well
      if (activeTab === 'logs') {
        queryClient.invalidateQueries({ queryKey: ['instantly-logs'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to sync workflows',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Calculate total pages
  const totalPages = Math.ceil(
    (activeTab === 'workflows' ? (workflowsData?.totalCount || 0) : (logsData?.totalCount || 0)) / pageSize
  );
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Instantly Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor your Instantly workflows
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Syncing...' : 'Sync Workflows'}
          </Button>
        </div>
      </div>
      
      {configData && (
        <Card className="bg-muted/40">
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last synced: {formatDate(configData?.last_updated || '')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            API Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflows" className="space-y-4">
          {workflowsError ? (
            <Card className="bg-destructive/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Error Loading Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{(workflowsError as Error).message}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => refetchWorkflows()}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Workflows</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search workflows..."
                          className="pl-8 w-[250px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingWorkflows ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                      <p>Loading workflows...</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead 
                                className="cursor-pointer"
                                onClick={() => handleSortChange('workflow_name')}
                              >
                                <div className="flex items-center">
                                  Name
                                  {sortField === 'workflow_name' && (
                                    sortDirection === 'asc' ? 
                                      <ChevronUp className="ml-1 h-4 w-4" /> : 
                                      <ChevronDown className="ml-1 h-4 w-4" />
                                  )}
                                </div>
                              </TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead 
                                className="cursor-pointer"
                                onClick={() => handleSortChange('status')}
                              >
                                <div className="flex items-center">
                                  Status
                                  {sortField === 'status' && (
                                    sortDirection === 'asc' ? 
                                      <ChevronUp className="ml-1 h-4 w-4" /> : 
                                      <ChevronDown className="ml-1 h-4 w-4" />
                                  )}
                                </div>
                              </TableHead>
                              <TableHead 
                                className="cursor-pointer"
                                onClick={() => handleSortChange('created_at')}
                              >
                                <div className="flex items-center">
                                  Created
                                  {sortField === 'created_at' && (
                                    sortDirection === 'asc' ? 
                                      <ChevronUp className="ml-1 h-4 w-4" /> : 
                                      <ChevronDown className="ml-1 h-4 w-4" />
                                  )}
                                </div>
                              </TableHead>
                              <TableHead 
                                className="cursor-pointer"
                                onClick={() => handleSortChange('updated_at')}
                              >
                                <div className="flex items-center">
                                  Updated
                                  {sortField === 'updated_at' && (
                                    sortDirection === 'asc' ? 
                                      <ChevronUp className="ml-1 h-4 w-4" /> : 
                                      <ChevronDown className="ml-1 h-4 w-4" />
                                  )}
                                </div>
                              </TableHead>
                              <TableHead>Tags</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {workflowsData?.workflows && workflowsData.workflows.length > 0 ? (
                              workflowsData.workflows.map((workflow) => (
                                <TableRow key={workflow.id}>
                                  <TableCell className="font-medium">{workflow.workflow_name}</TableCell>
                                  <TableCell>{workflow.description || 'No description'}</TableCell>
                                  <TableCell>
                                    <div className={`px-2 py-1 rounded-full text-xs inline-block ${
                                      workflow.is_active 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                      {workflow.status || (workflow.is_active ? 'Active' : 'Inactive')}
                                    </div>
                                  </TableCell>
                                  <TableCell>{formatDate(workflow.created_at)}</TableCell>
                                  <TableCell>{formatDate(workflow.updated_at)}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {workflow.tags && workflow.tags.length > 0 
                                        ? workflow.tags.map((tag, index) => (
                                            <span 
                                              key={index} 
                                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                            >
                                              {tag}
                                            </span>
                                          ))
                                        : 'No tags'
                                      }
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  {searchTerm 
                                    ? 'No workflows found matching your search.' 
                                    : 'No workflows available. Click "Sync Workflows" to fetch data.'}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Showing {workflowsData?.workflows?.length || 0} of {workflowsData?.totalCount || 0} workflows
                          </span>
                          <select
                            className="border rounded p-1 text-sm"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                          >
                            {PAGE_SIZES.map(size => (
                              <option key={size} value={size}>
                                {size} per page
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {totalPages > 1 && (
                          <div className="space-x-2 flex">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <div className="flex items-center">
                              <span className="text-sm">
                                Page {currentPage} of {totalPages}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Logs</CardTitle>
              <CardDescription>
                Recent API calls to the Instantly service
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p>Loading logs...</p>
                </div>
              ) : logsError ? (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive">
                  <h3 className="font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Error Loading Logs
                  </h3>
                  <p className="mt-1">{(logsError as Error).message}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => refetchLogs()}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Endpoint</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration (ms)</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logsData?.logs && logsData.logs.length > 0 ? (
                          logsData.logs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>{formatDate(log.timestamp)}</TableCell>
                              <TableCell className="font-medium">{log.endpoint}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  log.status >= 200 && log.status < 300
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                  {log.status}
                                </span>
                              </TableCell>
                              <TableCell>{log.duration_ms || 'N/A'}</TableCell>
                              <TableCell className="max-w-[300px] truncate">
                                {log.error_message || 'None'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              No logs available.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Showing {logsData?.logs?.length || 0} of {logsData?.totalCount || 0} logs
                      </span>
                      <select
                        className="border rounded p-1 text-sm"
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                      >
                        {PAGE_SIZES.map(size => (
                          <option key={size} value={size}>
                            {size} per page
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="space-x-2 flex">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center">
                          <span className="text-sm">
                            Page {currentPage} of {totalPages}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstantlyDashboard;
