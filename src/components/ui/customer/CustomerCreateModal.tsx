
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CustomerForm from './CustomerForm';

interface CustomerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

// This should match what we actually insert into the companies table
interface CustomerFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  projects: number;
}

const CustomerCreateModal = ({ isOpen, onClose, onCustomerCreated }: CustomerCreateModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'active',
    projects: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Customer email is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Creating customer with data:', formData);
      
      // Step 1: Create the company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.company || formData.name, // Use company name if provided, otherwise use customer name
          contact_email: formData.email,
          contact_phone: formData.phone
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
      
      // Step 2: Create the user using Supabase Auth Admin API (requires edge function)
      const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          name: formData.name,
          company_id: companyData.id,
          role: 'customer'
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
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'active',
        projects: 0,
      });
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        
        <CustomerForm 
          onSubmit={handleSubmit}
          formData={formData}
          onChange={handleChange}
          loading={loading}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CustomerCreateModal;
