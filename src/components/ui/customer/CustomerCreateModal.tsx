
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
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Properly access form elements using FormData API instead of direct access
    const formData = new FormData(e.currentTarget);
    
    // Extract values from form data
    const customerData: AddCustomerFormData = {
      fullName: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      role: formData.get('role')?.toString() as 'admin' | 'manager' | 'customer' || 'customer',
      companyName: formData.get('company')?.toString() || formData.get('name')?.toString() || '',
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
          onSubmit={handleFormSubmit}
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
