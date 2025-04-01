
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ChevronLeft, Edit, UserCog } from 'lucide-react';
import { useCustomerDetail } from '@/hooks/use-customer-detail';
import { useCustomerMetrics } from '@/hooks/use-customer-metrics';
import CustomerProfileHeader from '@/components/ui/customer/CustomerProfileHeader';
import CustomerContactInfo from '@/components/ui/customer/CustomerContactInfo';
import CustomerCompanyInfo from '@/components/ui/customer/CustomerCompanyInfo';
import CustomerDetailSkeleton from '@/components/ui/customer/CustomerDetailSkeleton';
import CustomerDetailError from '@/components/ui/customer/CustomerDetailError';
import CustomerEditDialog from '@/components/ui/customer/CustomerEditDialog';
import RoleManagementDialog from '@/components/ui/user/RoleManagementDialog';
import { CustomerMetricsForm } from '@/components/ui/customer/CustomerMetricsForm';
import { Button } from '@/components/ui/button';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customer, loading, error, refreshCustomer } = useCustomerDetail(id);
  const { 
    metrics, 
    loading: metricsLoading, 
    refetchMetrics 
  } = useCustomerMetrics(customer?.company_id);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };
  
  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };
  
  const handleManageRole = () => {
    setIsRoleDialogOpen(true);
  };

  const renderPageHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <button onClick={handleBack} className="mr-4">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Customer Details</h1>
      </div>
      
      {customer && (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleManageRole}
            className="flex items-center gap-1"
          >
            <UserCog size={16} className="mr-1" />
            Manage Role
          </Button>
          <Button 
            onClick={handleEditProfile}
            className="flex items-center gap-1"
          >
            <Edit size={16} className="mr-1" />
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        {renderPageHeader()}
        <CustomerDetailSkeleton />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8">
        {renderPageHeader()}
        <CustomerDetailError 
          error={error || 'Customer not found'} 
          onRetry={() => window.location.reload()}
        />
        <button 
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {renderPageHeader()}
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <CustomerProfileHeader customer={customer} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <CustomerContactInfo customer={customer} />
            <CustomerCompanyInfo customer={customer} />
          </div>
          
          {/* Add Customer Metrics Form */}
          {customer.company_id && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
              <CustomerMetricsForm 
                customerId={customer.company_id}
                metrics={metrics}
                onMetricsUpdated={refetchMetrics}
              />
            </div>
          )}
          
          {customer.notes && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm whitespace-pre-line">{customer.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Dialog */}
      {customer && (
        <CustomerEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          customer={customer}
          onProfileUpdated={refreshCustomer}
        />
      )}
      
      {/* Role Management Dialog */}
      {customer && (
        <RoleManagementDialog
          isOpen={isRoleDialogOpen}
          onClose={() => setIsRoleDialogOpen(false)}
          userId={customer.id}
          onRoleUpdated={refreshCustomer}
        />
      )}
    </div>
  );
};

export default CustomerDetail;
