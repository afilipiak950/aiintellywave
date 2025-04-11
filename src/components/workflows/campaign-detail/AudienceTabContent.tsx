
import React from 'react';
import { Mail } from "lucide-react";

interface AudienceTabContentProps {
  campaign: any;
}

export const AudienceTabContent: React.FC<AudienceTabContentProps> = ({ campaign }) => {
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-gray-50 p-4">
        <h3 className="font-medium mb-2">Email List</h3>
        {campaign?.email_list?.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {campaign.email_list.map((email: string, index: number) => (
              <div key={index} className="flex items-center p-2 bg-white rounded-md border">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm">{email}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No email list available</p>
        )}
      </div>
    </div>
  );
};
