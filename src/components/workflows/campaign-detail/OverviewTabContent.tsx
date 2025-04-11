
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Activity, Clock, MailOpen, MessageSquare } from "lucide-react";

interface OverviewTabContentProps {
  campaign: any;
}

export const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ campaign }) => {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <Badge 
            variant="outline"
            className="bg-amber-50 text-amber-800 border-amber-200 font-normal"
          >
            {campaign?.status === 1 ? 'Active' : 'Paused'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Created</h3>
          <p className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            {formatDate(campaign?.created_at)}
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Campaign Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-500 mb-1 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              Emails Sent
            </div>
            <div className="text-xl font-semibold">{campaign?.emailsSent || campaign?.statistics?.emailsSent || 0}</div>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-500 mb-1 flex items-center">
              <MailOpen className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              Opens
            </div>
            <div className="text-xl font-semibold">{campaign?.opens || 0}</div>
            <div className="text-xs text-gray-500">{campaign?.openRate || campaign?.statistics?.openRate || 0}% rate</div>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-500 mb-1 flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              Replies
            </div>
            <div className="text-xl font-semibold">{campaign?.replies || 0}</div>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-500 mb-1 flex items-center">
              <Activity className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              Bounce Rate
            </div>
            <div className="text-xl font-semibold">{campaign?.bounceRate || '0'}%</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Campaign Tags</h3>
        <div className="flex flex-wrap gap-1">
          {campaign?.tags?.length > 0 ? (
            campaign.tags.map((tag: string, index: number) => (
              <Badge 
                key={index} 
                variant="outline"
                className="text-xs bg-gray-50 text-gray-600 border-gray-200"
              >
                {tag}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500">No tags assigned</p>
          )}
        </div>
      </div>
      
      {campaign?.dailyLimit && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Daily Sending Limit</h3>
          <p className="text-sm flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            {campaign.dailyLimit} emails per day
          </p>
        </div>
      )}
    </div>
  );
};
