
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AddCustomerForm from './AddCustomerForm';
import { AddCustomerFormData } from './types';

interface CustomerModalContentProps {
  onSubmit: (data: AddCustomerFormData) => void;
  loading: boolean;
  onCancel: () => void;
}

const CustomerModalContent = ({ onSubmit, loading, onCancel }: CustomerModalContentProps) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogDescription>
          Create a new customer and associate them with a company. 
          The customer will be created with login credentials.
        </DialogDescription>
      </DialogHeader>
      
      <AddCustomerForm 
        onSubmit={onSubmit}
        loading={loading}
        onCancel={onCancel}
      />
    </>
  );
};

export default CustomerModalContent;
