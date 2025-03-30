
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AddCustomerModal from './AddCustomerModal';

interface AddCustomerButtonProps {
  onCustomerCreated?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * A specialized button for adding new customers with a comprehensive form
 */
const AddCustomerButton = ({ 
  onCustomerCreated, 
  variant = 'default' 
}: AddCustomerButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCustomerCreated = () => {
    setIsModalOpen(false);
    if (onCustomerCreated) {
      onCustomerCreated();
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)} 
        variant={variant}
        className="gap-2"
      >
        <Plus size={18} />
        Add Customer
      </Button>

      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </>
  );
};

export default AddCustomerButton;
