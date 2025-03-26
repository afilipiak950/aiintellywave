
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CustomerProfileFormProps {
  customerId: string;
  initialData?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    position?: string;
    address?: string;
    department?: string;
    job_title?: string;
    company_size?: number;
    linkedin_url?: string;
    notes?: string;
  };
  onProfileUpdated: () => void;
  onCancel?: () => void;
}

const CustomerProfileForm = ({
  customerId,
  initialData = {},
  onProfileUpdated,
  onCancel
}: CustomerProfileFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      first_name: initialData.first_name || '',
      last_name: initialData.last_name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      position: initialData.position || '',
      address: initialData.address || '',
      department: initialData.department || '',
      job_title: initialData.job_title || '',
      company_size: initialData.company_size?.toString() || '',
      linkedin_url: initialData.linkedin_url || '',
      notes: initialData.notes || ''
    }
  });
  
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Convert company_size to number if provided
      const formattedData = {
        ...data,
        company_size: data.company_size ? parseInt(data.company_size) : null
      };
      
      // Update the profile in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update(formattedData)
        .eq('id', customerId);
        
      if (error) throw error;
      
      toast({
        title: 'Profile Updated',
        description: 'The customer profile has been successfully updated.'
      });
      
      onProfileUpdated();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            {...register('first_name')}
            placeholder="First name"
          />
          {errors.first_name && (
            <p className="text-sm text-red-500">{errors.first_name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            {...register('last_name')}
            placeholder="Last name"
          />
          {errors.last_name && (
            <p className="text-sm text-red-500">{errors.last_name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Email address"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="Phone number"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            {...register('position')}
            placeholder="Position/Title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            {...register('department')}
            placeholder="Department"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="job_title">Job Title</Label>
          <Input
            id="job_title"
            {...register('job_title')}
            placeholder="Job title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company_size">Company Size</Label>
          <Input
            id="company_size"
            type="number"
            {...register('company_size')}
            placeholder="Number of employees"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Full address"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input
            id="linkedin_url"
            {...register('linkedin_url')}
            placeholder="LinkedIn profile URL"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Additional notes about this customer"
            rows={4}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerProfileForm;
