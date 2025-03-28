
import React from 'react';

interface CompanyProjectsErrorProps {
  error: string | null;
}

const CompanyProjectsError = ({ error }: CompanyProjectsErrorProps) => {
  return (
    <div className="text-center p-8 bg-red-50 rounded-lg">
      <p className="text-red-500 font-medium">{error}</p>
      <p className="text-gray-600 mt-2">Please try again later</p>
    </div>
  );
};

export default CompanyProjectsError;
