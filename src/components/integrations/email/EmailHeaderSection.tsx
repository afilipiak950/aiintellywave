
import React from 'react';
import { Mail } from 'lucide-react';

export const EmailHeaderSection: React.FC = () => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="bg-blue-50 p-3 rounded-full">
        <Mail className="w-6 h-6 text-blue-500" />
      </div>
      <div>
        <h2 className="text-xl font-medium">Email Integration</h2>
        <p className="text-sm text-gray-500">Connect your email account to send messages directly from the platform</p>
      </div>
    </div>
  );
};
