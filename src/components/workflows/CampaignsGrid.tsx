
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, ExternalLink, Mail, RefreshCw, User, Building, Info } from "lucide-react";

type CampaignsGridProps = {
  campaigns: any[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  onView: (campaign: any) => void;
  dataSource?: string;
};

export const CampaignsGrid: React.FC<CampaignsGridProps> = ({
  campaigns,
  isLoading,
  searchTerm,
  onView,
  dataSource
}) => {
  // Filter campaigns based on search term
  const filteredCampaigns = React.useMemo(() => {
    if (!campaigns) return [];
    if (!searchTerm) return campaigns;
    
    const term = searchTerm.toLowerCase();
    return campaigns.filter(campaign => 
      campaign.name?.toLowerCase().includes(term) || 
      campaign.description?.toLowerCase().includes(term)
    );
  }, [campaigns, searchTerm]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-9 w-20 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
        <h3 className="mt-4 text-lg font-medium">No campaigns available</h3>
        <p className="text-muted-foreground mt-2">
          {dataSource === 'fallback' 
            ? 'Connected to Instantly.ai backup data. Please refresh to try connecting to the live API.'
            : 'No campaigns were found. Try refreshing or adding campaigns in Instantly.ai.'}
        </p>
      </div>
    );
  }
  
  if (filteredCampaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <Info className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No matching campaigns</h3>
        <p className="text-muted-foreground mt-2">
          No campaigns matched your search term "{searchTerm}".
        </p>
      </div>
    );
  }
  
  // Format status for display
  const formatStatus = (status: any): string => {
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Draft';
        case 1: return 'Active';
        case 2: return 'Paused';
        case 3: return 'Paused';
        case 4: return 'Completed';
        case 5: return 'Stopped';
        default: return 'Unknown';
      }
    }
    return typeof status === 'string' 
      ? status.charAt(0).toUpperCase() + status.slice(1) 
      : 'Unknown';
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCampaigns.map((campaign) => (
        <Card key={campaign.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg truncate" title={campaign.name}>
                  {campaign.name}
                </h3>
                <Badge 
                  className={
                    (campaign.status === 'active' || campaign.status === 1) 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : (campaign.status === 'paused' || campaign.status === 2 || campaign.status === 3)
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }
                >
                  {formatStatus(campaign.status)}
                </Badge>
              </div>
              
              {campaign.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {campaign.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-y-4 mt-4">
                <div className="w-1/2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      {campaign.statistics?.emailsSent || campaign.sent || 0} sent
                    </span>
                  </div>
                </div>
                <div className="w-1/2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {campaign.statistics?.replies || campaign.replies || 0} replies
                    </span>
                  </div>
                </div>
                
                <div className="w-1/2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">
                      {campaign.company_assignments_count || 0} companies
                    </span>
                  </div>
                </div>
                <div className="w-1/2">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm">
                      {campaign.statistics?.openRate || campaign.openRate || 0}% opens
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => onView(campaign)}
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
