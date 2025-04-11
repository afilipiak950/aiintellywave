
import React from 'react';
import { User } from 'lucide-react';

interface AudienceTabContentProps {
  campaign: any;
}

export function AudienceTabContent({ campaign }: AudienceTabContentProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted p-4">
        <h3 className="font-medium mb-4">Email Recipients</h3>
        {campaign?.email_list?.length > 0 ? (
          <div className="space-y-2">
            {campaign.email_list.map((email: string, index: number) => (
              <div key={index} className="flex items-center p-3 bg-card rounded-md">
                <User className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>{email}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No email recipients available</p>
        )}
      </div>
    </div>
  );
}
