
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Import tab content components
import { OverviewTabContent } from './OverviewTabContent';
import { SequencesTabContent } from './SequencesTabContent';
import { SettingsTabContent } from './SettingsTabContent';

interface CampaignDetailModalProps {
  campaign: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CampaignDetailModal({ campaign, isOpen, onClose }: CampaignDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get campaign status - either from campaign object or default to "paused"
  const campaignStatus = campaign?.status ? 
    (campaign.status === 1 ? 'active' : 'paused') : 'paused';
  
  // Format date for display DD.M.YYYY, HH:MM:SS
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[1000px] p-0 rounded-md overflow-hidden">
        <div className="relative bg-white shadow-lg rounded-md">
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Header */}
          <div className="p-6 pb-3">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{campaign?.name || 'Homepage & RegioListing'}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Campaign ID: {campaign?.id || 'd0c8f38c-8d52-4e8a-be40-7a6a63c0d2f4'}
                </p>
              </div>
              
              {campaignStatus === 'paused' && (
                <Badge 
                  className="bg-amber-100 text-amber-800 border-0 rounded px-2 py-1"
                >
                  Paused
                </Badge>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                className={`px-8 py-4 text-center ${activeTab === 'overview' ? 'bg-[#f0f4f9] text-gray-800' : 'bg-white text-gray-600'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-8 py-4 text-center ${activeTab === 'sequences' ? 'bg-[#f0f4f9] text-gray-800' : 'bg-white text-gray-600'}`}
                onClick={() => setActiveTab('sequences')}
              >
                Sequences
              </button>
              <button
                className={`px-8 py-4 text-center ${activeTab === 'settings' ? 'bg-[#f0f4f9] text-gray-800' : 'bg-white text-gray-600'}`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
              <button
                className={`px-8 py-4 text-center ${activeTab === 'advanced' ? 'bg-[#f0f4f9] text-gray-800' : 'bg-white text-gray-600'}`}
                onClick={() => setActiveTab('advanced')}
              >
                Advanced
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="bg-[#f0f4f9] p-6">
            {activeTab === 'overview' && (
              <OverviewTabContent campaign={campaign} formatDate={formatDate} />
            )}
            
            {activeTab === 'sequences' && (
              <SequencesTabContent campaign={campaign} />
            )}
            
            {activeTab === 'settings' && (
              <SettingsTabContent campaign={campaign} />
            )}
            
            {activeTab === 'advanced' && (
              <div className="min-h-[300px] flex items-center justify-center text-gray-500">
                Advanced settings not configured
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 flex justify-end bg-white border-t">
            <Button 
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
