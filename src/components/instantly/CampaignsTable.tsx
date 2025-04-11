
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DownloadCloud, Search, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CampaignsGrid } from '@/components/workflows/CampaignsGrid';

interface CampaignsTableProps {
  campaigns: any[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleViewCampaign: (campaign: any) => void;
  campaignsSource?: string;
  handleSyncCampaigns: () => void;
  isSyncing: boolean;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  campaignsCount: number;
  setPageSize: (size: number) => void;
  handlePageChange: (page: number) => void;
}

const PAGE_SIZES = [10, 25, 50, 100];

const CampaignsTable: React.FC<CampaignsTableProps> = ({
  campaigns,
  isLoading,
  searchTerm,
  setSearchTerm,
  handleViewCampaign,
  campaignsSource,
  handleSyncCampaigns,
  isSyncing,
  totalPages,
  currentPage,
  pageSize,
  campaignsCount,
  setPageSize,
  handlePageChange
}) => {
  return (
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
            <Button 
              onClick={handleSyncCampaigns}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Campaigns'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CampaignsGrid 
          campaigns={campaigns}
          isLoading={isLoading}
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
  );
};

export default CampaignsTable;
