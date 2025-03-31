
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
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            
            // Properly access form elements using FormData by casting to HTMLFormElement
            const form = e.currentTarget as HTMLFormElement;
            const formElements = form.elements as HTMLFormControlsCollection;
            
            // Access form fields properly with type casting
            const nameInput = formElements.namedItem('name') as HTMLInputElement;
            const companyInput = formElements.namedItem('company') as HTMLInputElement;
            const emailInput = formElements.namedItem('email') as HTMLInputElement;
            const phoneInput = formElements.namedItem('phone') as HTMLInputElement;
            const statusInput = formElements.namedItem('status') as HTMLInputElement;
            const roleInput = formElements.namedItem('role') as HTMLInputElement;
            
            // Now use the form data with proper types
            handleFormSubmit({
              name: nameInput.value,
              company: companyInput.value,
              email: emailInput.value,
              phone: phoneInput.value,
              status: statusInput.value,
              projects: 0,
              role: roleInput.value,
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
