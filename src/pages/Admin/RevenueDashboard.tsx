
import React from 'react';
import { RevenueDashboard } from '@/components/ui/admin/revenue';
import { AdminRoute } from '@/components/auth/ProtectedRoutes';

const AdminRevenueDashboardPage = () => {
  return (
    <AdminRoute>
      <div className="space-y-6">
        <RevenueDashboard />
      </div>
    </AdminRoute>
  );
};

export default AdminRevenueDashboardPage;
