
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCustomerCreation } from '@/hooks/use-customer-creation';
import CustomerModalContent from './CustomerModalContent';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

const AddCustomerModal = ({ 
  isOpen, 
  onClose, 
  onCustomerCreated 
}: AddCustomerModalProps) => {
  const { loading, createCustomer } = useCustomerCreation(onCustomerCreated, onClose);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <CustomerModalContent
          onSubmit={createCustomer}
          loading={loading}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal;
