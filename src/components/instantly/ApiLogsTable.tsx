
import React from 'react';
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
import { RefreshCw, AlertCircle, Database } from 'lucide-react';

interface ApiLogsTableProps {
  logs: any[] | undefined;
  isLoadingLogs: boolean;
  logsError: Error | null;
  loadLogs: () => void;
  formatDate: (dateString: string | null) => string;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  logsCount: number;
  setPageSize: (size: number) => void;
  handlePageChange: (page: number) => void;
}

const PAGE_SIZES = [10, 25, 50, 100];

const ApiLogsTable: React.FC<ApiLogsTableProps> = ({
  logs,
  isLoadingLogs,
  logsError,
  loadLogs,
  formatDate,
  totalPages,
  currentPage,
  pageSize,
  logsCount,
  setPageSize,
  handlePageChange
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>API Logs</CardTitle>
            <CardDescription>
              Recent API calls to the Instantly service
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadLogs}
            disabled={isLoadingLogs}
          >
            <Database className="h-4 w-4 mr-2" />
            Refresh Logs
          </Button>
        </div>
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
              onClick={loadLogs}
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
                  {logs && logs.length > 0 ? (
                    logs.map((log) => (
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
                  Showing {logs?.length || 0} of {logsCount || 0} logs
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

export default ApiLogsTable;
