
import React from 'react';
import AdminSearchStringsList from '@/components/admin/search-strings/SearchStringsList';

const AdminSearchStrings: React.FC = () => {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Search Strings</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <AdminSearchStringsList />
      </div>
    </div>
  );
};

export default AdminSearchStrings;
