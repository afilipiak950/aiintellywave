
import React from 'react';

interface ManagerDashboardHeaderProps {
  companyName: string;
}

const ManagerDashboardHeader = ({ companyName }: ManagerDashboardHeaderProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>
      {companyName && (
        <p className="text-gray-500">Managing {companyName}</p>
      )}
    </div>
  );
};

export default ManagerDashboardHeader;
