
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';

const LinkedInIntegrationTab = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-full">
          <Linkedin className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h2 className="text-xl font-medium">LinkedIn Integration</h2>
          <p className="text-sm text-gray-500">Connect your LinkedIn account to import contacts and share updates</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <p className="text-sm">
          Connecting your LinkedIn account allows you to import contacts, share updates, and track engagement directly from the platform.
        </p>
      </div>

      <Button className="bg-[#0077B5] hover:bg-[#00669c]">
        <Linkedin className="w-5 h-5 mr-2" />
        Connect with LinkedIn
      </Button>
    </Card>
  );
};

export default LinkedInIntegrationTab;
