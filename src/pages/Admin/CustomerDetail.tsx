
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, Edit, UserCog, Clock } from 'lucide-react';
import { useCustomerDetail } from '@/hooks/use-customer-detail';
import { useCustomerMetrics } from '@/hooks/use-customer-metrics';
import CustomerProfileHeader from '@/components/ui/customer/CustomerProfileHeader';
import CustomerContactInfo from '@/components/ui/customer/CustomerContactInfo';
import CustomerCompanyInfo from '@/components/ui/customer/CustomerCompanyInfo';
import CustomerDetailSkeleton from '@/components/ui/customer/CustomerDetailSkeleton';
import CustomerDetailError from '@/components/ui/customer/CustomerDetailError';
import CustomerEditDialog from '@/components/ui/customer/CustomerEditDialog';
import RoleManagementDialog from '@/components/ui/user/RoleManagementDialog';
import UserActivityPanel from '@/components/ui/user/UserActivityPanel';
import { CustomerMetricsForm } from '@/components/ui/customer/CustomerMetricsForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorBoundary from '@/components/ErrorBoundary';
import { toast } from '@/hooks/use-toast';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Add fallback UI for the entire component
  return (
    <ErrorBoundary
      fallback={
        <div className="p-8">
          <div className="flex items-center mb-6">
            <button onClick={() => navigate(-1)} className="mr-4">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">Customer Details</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
            <h2 className="text-xl font-semibold mb-2">An error occurred loading the customer details</h2>
            <p className="mb-4">There was a problem displaying this customer's information.</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
            <Button className="ml-2" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      }
    >
      <CustomerDetailContent />
    </ErrorBoundary>
  );
};

// Separate the content to enable better error boundaries
const CustomerDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log('[CustomerDetail] Rendering with customer ID:', id);
  
  const { customer, loading, error, refreshCustomer } = useCustomerDetail(id);
  const { 
    metrics, 
    loading: metricsLoading, 
    refetchMetrics 
  } = useCustomerMetrics(customer?.company_id);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Log customer data when it changes for debugging
  useEffect(() => {
    if (customer) {
      console.log('[CustomerDetail] Customer data loaded:', {
        id: customer.id,
        company_id: customer.company_id,
        associated_companies: customer.associated_companies
      });
    }
  }, [customer]);

  const handleBack = () => {
    navigate(-1);
  };
  
  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };
  
  const handleManageRole = () => {
    setIsRoleDialogOpen(true);
  };

  const handleProfileUpdated = () => {
    console.log('[CustomerDetail] Profile updated, refreshing data...');
    
    // Show toast notification
    toast({
      title: 'Profile Updated',
      description: 'Customer details have been updated successfully.',
    });
    
    // Refresh both customer data and metrics
    refreshCustomer();
    if (customer?.company_id) {
      refetchMetrics();
    }
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User size={16} />
            Profile
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1">
            <Clock size={16} />
            Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-0">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <CustomerProfileHeader customer={customer} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <CustomerContactInfo customer={customer} />
                <CustomerCompanyInfo customer={customer} />
              </div>
              
              {/* Add Customer Metrics Form */}
              {customer?.company_id && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Track and manage key performance indicators for this customer including conversion rate
                    and appointments with candidates.
                  </p>
                  <CustomerMetricsForm 
                    customerId={customer.company_id}
                    metrics={metrics}
                    onMetricsUpdated={refetchMetrics}
                  />
                </div>
              )}
              
              {customer?.notes && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm whitespace-pre-line">{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0">
          {customer?.id && (
            <UserActivityPanel userId={customer.id} />
          )}
        </TabsContent>
      </Tabs>
      
      {/* Edit Dialog */}
      {customer && (
        <CustomerEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          customer={customer}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
      
      {/* Role Management Dialog */}
      {customer && (
        <RoleManagementDialog
          isOpen={isRoleDialogOpen}
          onClose={() => setIsRoleDialogOpen(false)}
          userId={customer.id}
          onRoleUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

// Missing imports from the diff
import { User } from 'lucide-react';

export default CustomerDetail;
