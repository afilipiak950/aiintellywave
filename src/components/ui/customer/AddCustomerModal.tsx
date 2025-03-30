
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AddCustomerForm from './AddCustomerForm';
import { AddCustomerFormData } from './types';

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
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (formData: AddCustomerFormData) => {
    try {
      setLoading(true);
      
      console.log('Creating customer with data:', formData);
      
      let companyId = formData.companyId;
      
      // Step 1: Create the company record if we don't have an existing company ID
      if (!companyId) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: formData.companyName || formData.fullName, // Use company name if provided, otherwise use customer name
            contact_email: formData.email,
            contact_phone: formData.phone,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            industry: formData.industry
          })
          .select()
          .single();
          
        if (companyError) {
          console.error('Error creating company:', companyError);
          throw companyError;
        }
        
        if (!companyData) {
          throw new Error('Failed to create company: No data returned');
        }
        
        console.log('Company created successfully:', companyData);
        companyId = companyData.id;
      } else {
        console.log('Using existing company with ID:', companyId);
      }
      
      // Step 2: Create the user using Edge Function
      const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          name: formData.fullName,
          company_id: companyId,
          role: formData.role,
          language: formData.language || 'en'
        }
      });
      
      if (userError) {
        console.error('Error creating user:', userError);
        throw userError;
      }
      
      console.log('User created successfully:', userData);
      
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      
      onCustomerCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer and associate them with a company.
          </DialogDescription>
        </DialogHeader>
        
        <AddCustomerForm 
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal;
