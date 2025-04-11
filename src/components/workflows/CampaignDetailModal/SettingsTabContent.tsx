
import React from 'react';
import { Clock, Calendar, Check, X } from 'lucide-react';

interface SettingsTabContentProps {
  campaign?: any;
}

export function SettingsTabContent({ campaign }: SettingsTabContentProps) {
  // Ensure campaign object exists
  const campaignData = campaign || {};
  
  return (
    <div className="space-y-8">
      {/* Schedule Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Schedule Settings</h3>
        
        <div className="bg-white p-4 rounded-md">
          <div className="font-medium mb-3">New schedule</div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Time:</span>
              <span>09:00 - 18:00</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Timezone:</span>
              <span>America/Detroit</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Days:</span>
            <span>Mon, Tue, Wed, Thu, Fri</span>
          </div>
        </div>
      </div>
      
      {/* Sending Settings and Stop Conditions in 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sending Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Sending Settings</h3>
          
          <div className="space-y-0">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-500">Daily limit:</span>
              <span className="font-medium">{campaignData.daily_limit || 90}</span>
            </div>
            
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-500">Tracking links:</span>
              <span className="font-medium">Disabled</span>
            </div>
            
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-500">Tracking opens:</span>
              <span className="font-medium">Disabled</span>
            </div>
            
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-500">Text only:</span>
              <span className="font-medium">No</span>
            </div>
            
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-500">Match lead ESP:</span>
              <span className="font-medium">No</span>
            </div>
          </div>
        </div>
        
        {/* Stop Conditions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Stop Conditions</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                campaignData.stop_on_reply ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <Check className="h-3 w-3 text-white" />
              </div>
              <span>Stop on reply</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                !campaignData.stop_on_auto_reply ? 'bg-red-500' : 'bg-gray-300'
              }`}>
                <X className="h-3 w-3 text-white" />
              </div>
              <span>Stop on auto-reply</span>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <span className="text-gray-500">Auto variant select:</span>
              <span className="text-sm">Not configured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
