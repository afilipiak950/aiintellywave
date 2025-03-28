
import React from 'react';
import { Building } from 'lucide-react';

const CompanyProjectsEmpty = () => {
  return (
    <div className="text-center p-8 bg-gray-50 rounded-lg">
      <Building className="w-12 h-12 mx-auto text-gray-400" />
      <h3 className="mt-2 text-lg font-medium">No companies found</h3>
      <p className="text-gray-500">No companies are available in the system.</p>
    </div>
  );
};

export default CompanyProjectsEmpty;
