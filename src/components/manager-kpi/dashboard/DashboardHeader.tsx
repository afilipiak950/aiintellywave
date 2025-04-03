
import React from 'react';

const DashboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Manager KPI Dashboard</h1>
        <p className="text-muted-foreground">Monitor your team's performance and projects</p>
      </div>
    </div>
  );
};

export default DashboardHeader;
