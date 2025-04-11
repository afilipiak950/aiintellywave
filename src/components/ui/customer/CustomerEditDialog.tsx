import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UICustomer } from '@/types/customer';
import CustomerProfileForm from './CustomerProfileForm';
import TagsFormSection from './TagsFormSection';

interface CustomerEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: UICustomer;
  onProfileUpdated: () => void;
}

const CustomerEditDialog = ({
  isOpen,
  onClose,
  customer,
  onProfileUpdated
}: CustomerEditDialogProps) => {
  const [currentTags, setCurrentTags] = useState<string[]>(customer.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset tags when customer changes
  useEffect(() => {
    if (customer) {
      setCurrentTags(customer.tags || []);
    }
  }, [customer]);
  
  const handleTagsChange = (newTags: string[]) => {
    setCurrentTags(newTags);
  };
  
  const handleSaveTags = async () => {
    if (!customer.company_id) return;
    
    setIsSubmitting(true);
    try {
      // Update the company tags
      const { error } = await supabase
        .from('companies')
        .update({ tags: currentTags })
        .eq('id', customer.company_id);
    
      if (error) throw error;
    
      toast({
        title: 'Tags Updated',
        description: 'Customer tags have been successfully updated.'
      });
    
      onProfileUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating tags:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update tags',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Customer Profile</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid gap-6">
            <div className="p-4 border border-gray-200 rounded-md">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <TagsFormSection 
                tags={currentTags}
                onTagsChange={handleTagsChange}
              />
            </div>
            
            <div className="p-4 border border-gray-200 rounded-md">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <CustomerProfileForm
                customerId={customer.id}
                initialData={customer}
                onProfileUpdated={onProfileUpdated}
                onCancel={onClose}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTags}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerEditDialog;
