
import React from 'react';

interface AudienceTabContentProps {
  campaign: any;
}

export function AudienceTabContent({ campaign }: AudienceTabContentProps) {
  return (
    <div className="rounded-md bg-muted p-4">
      <h3 className="font-medium mb-2">Email List</h3>
      {campaign?.email_list?.length > 0 ? (
        <div className="space-y-2">
          {campaign.email_list.map((email: string, index: number) => (
            <div key={index} className="flex items-center p-2 bg-card rounded-md">
              <span>{email}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No email list available</p>
      )}
    </div>
  );
}
