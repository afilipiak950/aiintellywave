
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useCustomerDetail } from '@/hooks/use-customer-detail';
import CustomerProfileHeader from '@/components/ui/customer/CustomerProfileHeader';
import CustomerContactInfo from '@/components/ui/customer/CustomerContactInfo';
import CustomerCompanyInfo from '@/components/ui/customer/CustomerCompanyInfo';
import CustomerDetailSkeleton from '@/components/ui/customer/CustomerDetailSkeleton';
import CustomerDetailError from '@/components/ui/customer/CustomerDetailError';

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { customer, loading, error } = useCustomerDetail(customerId);

  const handleBack = () => {
    navigate(-1);
  };

  const renderPageHeader = () => (
    <div className="flex items-center mb-6">
      <button onClick={handleBack} className="mr-4">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="text-2xl font-bold">Customer Details</h1>
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
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
