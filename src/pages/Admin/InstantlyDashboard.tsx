import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInstantlyWorkflows } from '@/hooks/use-instantly-workflows';
import CampaignDetailModal from '@/components/campaigns/CampaignDetailModal';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, FileText, Clock } from 'lucide-react';

// Import our components
import CampaignsTable from '@/components/instantly/CampaignsTable';
import WorkflowsTable from '@/components/instantly/WorkflowsTable';
import ApiLogsTable from '@/components/instantly/ApiLogsTable';
import ConfigInfoCard from '@/components/instantly/ConfigInfoCard';
import CampaignTagEditor from '@/components/instantly/CampaignTagEditor';
import ErrorCard from '@/components/instantly/ErrorCard';

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

  const handleAddCampaignTag = (tag: string) => {
    if (!tag.trim()) return;
    
    if (!campaignTags.includes(tag.trim())) {
      setCampaignTags([...campaignTags, tag.trim()]);
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
      </div>
      
      <ConfigInfoCard configData={configData} formatDate={formatDate} />
      
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
            <ErrorCard 
              title="Error Loading Campaigns"
              error={campaignsError as Error}
              onRetry={loadCampaigns}
            />
          ) : (
            <CampaignsTable 
              campaigns={campaigns || []}
              isLoading={isLoadingCampaigns}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleViewCampaign={handleViewCampaign}
              campaignsSource={campaignsSource}
              handleSyncCampaigns={() => syncCampaignsMutation.mutate()}
              isSyncing={syncCampaignsMutation.isPending}
              totalPages={totalPages}
              currentPage={currentPage}
              pageSize={pageSize}
              campaignsCount={campaignsCount || 0}
              setPageSize={setPageSize}
              handlePageChange={handlePageChange}
            />
          )}
        </TabsContent>
        
        <TabsContent value="workflows" className="space-y-4">
          <WorkflowsTable 
            workflows={workflows}
            isLoading={isLoading}
            error={error}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortField={sortField}
            handleSortChange={handleSortChange}
            sortDirection={sortDirection}
            totalPages={totalPages}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount || 0}
            setPageSize={setPageSize}
            handlePageChange={handlePageChange}
            refetch={refetch}
            handleSyncWorkflows={() => syncWorkflowsMutation.mutate()}
            isSyncingWorkflows={syncWorkflowsMutation.isPending}
            formatDate={formatDate}
          />
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <ApiLogsTable 
            logs={logs}
            isLoadingLogs={isLoadingLogs}
            logsError={logsError}
            loadLogs={loadLogs}
            formatDate={formatDate}
            totalPages={totalPages}
            currentPage={currentPage}
            pageSize={pageSize}
            logsCount={logsCount || 0}
            setPageSize={setPageSize}
            handlePageChange={handlePageChange}
          />
        </TabsContent>
      </Tabs>
      
      <CampaignDetailModal
        campaign={selectedCampaign}
        isOpen={isCampaignDetailOpen}
        onClose={() => setIsCampaignDetailOpen(false)}
      />
      
      <CampaignTagEditor 
        isOpen={isTagEditorOpen}
        onClose={() => setIsTagEditorOpen(false)}
        campaignTags={campaignTags}
        onSave={handleSaveCampaignTags}
        onAddTag={handleAddCampaignTag}
        onRemoveTag={handleRemoveCampaignTag}
        newTag={newTag}
        setNewTag={setNewTag}
      />
    </div>
  );
};

export default InstantlyDashboard;
