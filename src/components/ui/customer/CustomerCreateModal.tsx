
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

const CustomerCreateModal = ({ isOpen, onClose, onCustomerCreated }: CustomerCreateModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive',
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
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('companies')
        .insert([formData])
        .select()
        .single();
        
      if (error) throw error;
      
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
