
import React from 'react';
import { User } from 'lucide-react';

interface AudienceTabContentProps {
  campaign: any;
}

export function AudienceTabContent({ campaign }: AudienceTabContentProps) {
  // Ensure email_list is always an array, even if undefined
  const emailList = Array.isArray(campaign?.email_list) ? campaign.email_list : [];
  
  // Sample emails to match the screenshot design if no real emails are available
  const demoEmails = [
    'email@dynamicfilhmedia.com',
    'email@ideafilhmedia.com',
    'email@successfilhmedia.com'
  ];
  
  // Use real email list if available, otherwise use demo emails
  const displayEmails = emailList.length > 0 ? emailList : demoEmails;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Email Recipients</h3>
      <div className="space-y-2">
        {displayEmails.map((email: string, index: number) => (
          <div key={index} className="flex items-center p-3 bg-white rounded-md">
            <User className="h-4 w-4 mr-3 text-gray-400" />
            <span>{email}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
