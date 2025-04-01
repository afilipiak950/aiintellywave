
import React from 'react';
import { useCustomerMetrics } from '@/hooks/use-customer-metrics';
import { CustomerMetricsForm } from '@/components/ui/customer/CustomerMetricsForm';
import { Skeleton } from '@/components/ui/skeleton';

interface ManagerCustomerMetricsProps {
  companyId: string | undefined;
}

const ManagerCustomerMetrics = ({ companyId }: ManagerCustomerMetricsProps) => {
  const { 
    metrics, 
    loading, 
    error, 
    refetchMetrics 
  } = useCustomerMetrics(companyId);
  
  if (!companyId) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-medium mb-4">Performance Metrics</h2>
        <p className="text-gray-500">No company data available</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-medium mb-4">Performance Metrics</h2>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/3" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-medium mb-4">Performance Metrics</h2>
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <p>Failed to load metrics: {error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-medium mb-4">Performance Metrics</h2>
      <CustomerMetricsForm 
        customerId={companyId}
        metrics={metrics}
        onMetricsUpdated={refetchMetrics}
      />
    </div>
  );
};

export default ManagerCustomerMetrics;
