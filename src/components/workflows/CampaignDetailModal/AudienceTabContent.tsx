
import React from 'react';
import { User } from 'lucide-react';

interface AudienceTabContentProps {
  campaign: any;
}

export function AudienceTabContent({ campaign }: AudienceTabContentProps) {
  // Ensure email_list is always an array, even if undefined
  const emailList = Array.isArray(campaign?.email_list) ? campaign.email_list : [];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Email Recipients</h3>
      {emailList.length > 0 ? (
        <div className="space-y-2">
          {emailList.map((email: string, index: number) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-md">
              <User className="h-4 w-4 mr-3 text-muted-foreground" />
              <span>{email}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">No email recipients</p>
      )}
    </div>
  );
}
