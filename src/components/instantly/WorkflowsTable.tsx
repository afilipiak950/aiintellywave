
import React from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, Search, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface WorkflowsTableProps {
  workflows: any[] | undefined;
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortField: string;
  handleSortChange: (field: string) => void;
  sortDirection: 'asc' | 'desc';
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  setPageSize: (size: number) => void;
  handlePageChange: (page: number) => void;
  refetch: () => void;
  handleSyncWorkflows: () => void;
  isSyncingWorkflows: boolean;
  formatDate: (dateString: string | null) => string;
}

const PAGE_SIZES = [10, 25, 50, 100];

const WorkflowsTable: React.FC<WorkflowsTableProps> = ({
  workflows,
  isLoading,
  error,
  searchTerm,
  setSearchTerm,
  sortField,
  handleSortChange,
  sortDirection,
  totalPages,
  currentPage,
  pageSize,
  totalCount,
  setPageSize,
  handlePageChange,
  refetch,
  handleSyncWorkflows,
  isSyncingWorkflows,
  formatDate
}) => {
  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Loading Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{(error as Error).message}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={refetch}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workflows</CardTitle>
            <CardDescription>
              Your email automation workflows from Instantly
            </CardDescription>
          </div>
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
            <Button 
              onClick={handleSyncWorkflows}
              disabled={isSyncingWorkflows}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncingWorkflows ? 'animate-spin' : ''}`} />
              {isSyncingWorkflows ? 'Syncing...' : 'Sync Workflows'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
                  {workflows && workflows.length > 0 ? (
                    workflows.map((workflow) => (
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
                              ? workflow.tags.map((tag: string, index: number) => (
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
                  Showing {workflows?.length || 0} of {totalCount || 0} workflows
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
  );
};

export default WorkflowsTable;
