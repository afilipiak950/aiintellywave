
import React from 'react';
import { User, Mail, MessageSquare, Calendar } from 'lucide-react';

interface OverviewTabContentProps {
  campaign: any;
  formatDate: (dateString: string) => string;
}

export function OverviewTabContent({ campaign, formatDate }: OverviewTabContentProps) {
  // Default stats if not provided
  const stats = {
    emailsSent: campaign?.statistics?.emailsSent || 0,
    replies: campaign?.statistics?.replies || 0,
    opens: campaign?.statistics?.opens || 0,
    bounces: campaign?.statistics?.bounces || 0,
    openRate: campaign?.statistics?.openRate || 0
  };
  
  // Email recipients - use campaign data or provide defaults
  const emailList = Array.isArray(campaign?.email_list) ? campaign.email_list : [
    'email@dynamicfilhmedia.com',
    'email@ideafilhmedia.com',
    'email@successfilhmedia.com'
  ];

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left Column - Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Campaign Statistics</h3>
        
        <div className="flex items-start gap-2 mb-5">
          <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <div className="text-sm text-gray-600">Emails Sent</div>
            <div className="text-2xl font-bold text-gray-800">{stats.emailsSent}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2 mb-5">
          <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <div className="text-sm text-gray-600">Replies</div>
            <div className="text-2xl font-bold text-gray-800">{stats.replies}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2 mb-5">
          <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <div className="text-sm text-gray-600">Opens</div>
            <div className="text-2xl font-bold text-gray-800">{stats.opens}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2 mb-5">
          <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <div className="text-sm text-gray-600">Bounces</div>
            <div className="text-2xl font-bold text-gray-800">{stats.bounces}</div>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="text-sm text-gray-600 mb-1">Open Rate</div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${stats.openRate}%` }}
            ></div>
          </div>
          <div className="text-right text-sm mt-1">{stats.openRate}%</div>
        </div>
        
        <h3 className="text-lg font-semibold mt-8 mb-4">Email Recipients</h3>
        <div className="space-y-2">
          {emailList.map((email, index) => (
            <div key={index} className="flex items-center p-3 bg-white rounded-md">
              <User className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-gray-800">{email}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Column - Campaign Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Campaign Details</h3>
        
        <div className="flex justify-between py-3 border-b border-gray-200">
          <span className="text-gray-600">Created:</span>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>{formatDate(campaign?.created_at || '2025-04-10T11:48:04')}</span>
          </div>
        </div>
        
        <div className="flex justify-between py-3 border-b border-gray-200">
          <span className="text-gray-600">Updated:</span>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>{formatDate(campaign?.updated_at || '2025-04-10T12:14:35')}</span>
          </div>
        </div>
        
        <div className="flex justify-between py-3 border-b border-gray-200">
          <span className="text-gray-600">Daily limit:</span>
          <span className="font-medium">{campaign?.daily_limit || 90}</span>
        </div>
        
        <div className="flex justify-between py-3 border-b border-gray-200">
          <span className="text-gray-600">Stop on reply:</span>
          <span className="font-medium">{campaign?.stop_on_reply ? 'Yes' : 'No'}</span>
        </div>
        
        <div className="flex justify-between py-3 border-b border-gray-200">
          <span className="text-gray-600">Stop on auto-reply:</span>
          <span className="font-medium">{campaign?.stop_on_auto_reply ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
}
