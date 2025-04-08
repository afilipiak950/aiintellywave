
import React from 'react';
import LeadDatabaseContainer from '@/components/customer/LeadDatabaseContainer';

interface DashboardErrorProps {
  error: string;
  onRetry: () => void;
}

const DashboardError: React.FC<DashboardErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
      <h2 className="text-xl font-semibold text-red-700 mb-3">Dashboard Error</h2>
      <p className="text-red-600 mb-4">{error}</p>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
};

export default DashboardError;
