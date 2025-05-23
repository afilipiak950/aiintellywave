import React, { useState, useEffect } from 'react';
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
import { useInstantlyWorkflows } from '@/hooks/use-instantly-workflows';
import { 
  RefreshCw, 
  Search, 
  AlertCircle, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  FileText,
  BarChart,
  DownloadCloud,
  Database,
  Plus,
  X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignsGrid } from '@/components/workflows/CampaignsGrid';
import { CampaignDetailModal } from '@/components/workflows/CampaignDetailModal';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PAGE_SIZES = [10, 25, 50, 100];

const InstantlyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isCampaignDetailOpen, setIsCampaignDetailOpen] = useState(false);
  const [isLoadingCampaignDetail, setIsLoadingCampaignDetail] = useState(false);
  const [selectedCampaignForTagging, setSelectedCampaignForTagging] = useState<any>(null);
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
  const [campaignTags, setCampaignTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const { 
    workflows,
    totalCount,
    isLoading,
    error,
    configData,
    syncWorkflowsMutation,
    
    // Campaigns data
    campaigns,
    campaignsCount,
    campaignsSource,
    isLoadingCampaigns,
    campaignsError,
    syncCampaignsMutation,
    loadCampaigns,
    
    searchTerm,
    setSearchTerm,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    refetch,
    
    // Logs data
    logs,
    logsCount,
    isLoadingLogs,
    logsError,
    loadLogs
  } = useInstantlyWorkflows();
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'logs') {
      loadLogs();
    } else if (tab === 'campaigns') {
      loadCampaigns();
    }
  };
  
  useEffect(() => {
    if (activeTab === 'campaigns') {
      loadCampaigns();
    }
  }, [activeTab, loadCampaigns]);
  
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const totalPages = Math.ceil(
    (activeTab === 'workflows' ? (totalCount || 0) : 
     activeTab === 'campaigns' ? (campaignsCount || 0) : 
     (logsCount || 0)) / pageSize
  );
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  const handleViewCampaign = async (campaign: any) => {
    try {
      setIsLoadingCampaignDetail(true);
      setSelectedCampaign(campaign);
      setIsCampaignDetailOpen(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        console.error('No active session found');
        return;
      }
      
      const accessToken = sessionData.session.access_token;
      
      try {
        const response = await supabase.functions.invoke('instantly-ai', {
          body: { 
            action: 'getCampaignDetail',
            campaignId: campaign.id
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (response.data && response.data.campaign) {
          setSelectedCampaign(response.data.campaign);
        }
      } catch (error) {
        console.error('Failed to fetch campaign details:', error);
      }
    } catch (error) {
      console.error('Error viewing campaign:', error);
    } finally {
      setIsLoadingCampaignDetail(false);
    }
  };

  const handleEditCampaignTags = (campaign: any) => {
    handleViewCampaign(campaign);
    // Set the selected tab to 'companies' after a short delay to ensure modal is open
    setTimeout(() => {
      const tabTriggers = document.querySelectorAll('[role="tab"]');
      const companiesTab = Array.from(tabTriggers).find(tab => tab.textContent?.includes('Companies'));
      if (companiesTab && companiesTab instanceof HTMLElement) {
        companiesTab.click();
      }
    }, 100);
  };

  const handleAddCampaignTag = () => {
    if (!newTag.trim()) return;
    
    if (!campaignTags.includes(newTag.trim())) {
      setCampaignTags([...campaignTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveCampaignTag = (tagToRemove: string) => {
    setCampaignTags(campaignTags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveCampaignTags = async () => {
    if (!selectedCampaignForTagging) return;
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        console.error('No active session found');
        return;
      }
      
      const accessToken = sessionData.session.access_token;
      
      const response = await supabase.functions.invoke('instantly-ai', {
        body: { 
          action: 'updateCampaignTags',
          campaignId: selectedCampaignForTagging.id,
          tags: campaignTags
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to update campaign tags');
      }
      
      const updatedCampaigns = (campaigns || []).map(c => 
        c.id === selectedCampaignForTagging.id 
          ? { ...c, tags: campaignTags } 
          : c
      );
      
      syncCampaignsMutation.mutate();
      
      toast({
        title: 'Tags Updated',
        description: 'Campaign tags have been updated successfully.',
      });
      
      setIsTagEditorOpen(false);
    } catch (error: any) {
      console.error('Error updating campaign tags:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update campaign tags',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Instantly Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor your Instantly workflows and campaigns
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === 'workflows' && (
            <Button 
              onClick={() => syncWorkflowsMutation.mutate()}
              disabled={syncWorkflowsMutation.isPending}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncWorkflowsMutation.isPending ? 'animate-spin' : ''}`} />
              {syncWorkflowsMutation.isPending ? 'Syncing...' : 'Sync Workflows'}
            </Button>
          )}
          
          {activeTab === 'campaigns' && (
            <Button 
              onClick={() => syncCampaignsMutation.mutate()}
              disabled={syncCampaignsMutation.isPending}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncCampaignsMutation.isPending ? 'animate-spin' : ''}`} />
              {syncCampaignsMutation.isPending ? 'Syncing...' : 'Sync Campaigns'}
            </Button>
          )}
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
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            API Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="campaigns" className="space-y-4">
          {campaignsError ? (
            <Card className="bg-destructive/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Error Loading Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{(campaignsError as Error).message}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => loadCampaigns()}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Campaigns</CardTitle>
                    <CardDescription>
                      View and manage your email campaigns from Instantly
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search campaigns..."
                        className="pl-8 w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Feature in development",
                          description: "Export functionality will be available soon",
                        });
                      }}
                    >
                      <DownloadCloud className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CampaignsGrid 
                  campaigns={campaigns}
                  isLoading={isLoadingCampaigns}
                  searchTerm={searchTerm}
                  onView={handleViewCampaign}
                  dataSource={campaignsSource}
                />
                
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Showing {campaigns?.length || 0} of {campaignsCount || 0} campaigns
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
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="workflows" className="space-y-4">
          {error ? (
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
                  onClick={() => refetch()}
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
            </>
          )}
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
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
                  onClick={() => loadLogs()}
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
                    onClick={() => loadLogs()}
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
        </TabsContent>
      </Tabs>
      
      <CampaignDetailModal
        campaign={selectedCampaign}
        isOpen={isCampaignDetailOpen}
        onClose={() => setIsCampaignDetailOpen(false)}
      />
      
      <Dialog open={isTagEditorOpen} onOpenChange={setIsTagEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Campaign Tags</DialogTitle>
            <DialogDescription>
              Add tags to categorize this campaign. These tags will be used to match campaigns with customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {campaignTags.length > 0 ? (
                campaignTags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="px-2 py-1 flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 group"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 text-blue-400 cursor-pointer hover:text-blue-700 opacity-70 group-hover:opacity-100"
                      onClick={() => handleRemoveCampaignTag(tag)}
                    />
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No tags assigned yet.</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter a tag..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCampaignTag();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={handleAddCampaignTag}
                disabled={!newTag.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsTagEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCampaignTags}>
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstantlyDashboard;
