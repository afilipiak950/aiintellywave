
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCustomerCreation } from '@/hooks/use-customer-creation';
import CustomerForm from './CustomerForm';
import { AddCustomerFormData } from './types';

interface CustomerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

const CustomerCreateModal = ({ isOpen, onClose, onCustomerCreated }: CustomerCreateModalProps) => {
  const { loading, createCustomer } = useCustomerCreation(onCustomerCreated, onClose);
  
  const handleFormSubmit = (formData: any) => {
    // Convert CustomerForm data format to AddCustomerFormData format
    const customerData: AddCustomerFormData = {
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone || "",
      role: formData.role,
      companyName: formData.company || formData.name,
      language: 'en'
    };
    
    createCustomer(customerData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        
        <CustomerForm 
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit({
              name: e.currentTarget.name.value,
              company: e.currentTarget.company.value,
              email: e.currentTarget.email.value,
              phone: e.currentTarget.phone.value,
              status: e.currentTarget.status.value,
              projects: 0,
              role: e.currentTarget.role.value,
            });
          }}
          formData={{
            name: '',
            company: '',
            email: '',
            phone: '',
            status: 'active',
            projects: 0,
            role: 'customer',
          }}
          onChange={(e) => {
            // This is handled in the submit now
          }}
          loading={loading}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CustomerCreateModal;
