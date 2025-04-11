
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { CompanyData } from '@/services/types/customerTypes';
import TagsFormSection from '@/components/ui/customer/TagsFormSection';

interface CompanyEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onCompanyUpdated: () => void;
}

const CompanyEditDialog = ({
  isOpen,
  onClose,
  companyId,
  onCompanyUpdated
}: CompanyEditDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      contact_email: '',
      contact_phone: '',
      city: '',
      country: '',
      website: '',
      address: ''
    }
  });
  
  // Fetch company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;
      
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();
        
        if (error) throw error;
        
        setCompanyData(data);
        setTags(data.tags || []);
        form.reset({
          name: data.name || '',
          description: data.description || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          city: data.city || '',
          country: data.country || '',
          website: data.website || '',
          address: data.address || ''
        });
      } catch (error: any) {
        console.error('Error fetching company data:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load company data',
          variant: 'destructive'
        });
      }
    };
    
    if (isOpen && companyId) {
      fetchCompanyData();
    }
  }, [isOpen, companyId, form]);
  
  const handleSubmit = async (formData: any) => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      // Include tags in the update
      const updateData = {
        ...formData,
        tags: tags
      };
      
      const { error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', companyId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Company information updated successfully'
      });
      
      onCompanyUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update company information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="border rounded-md p-4">
              <TagsFormSection
                tags={tags}
                onTagsChange={handleTagsChange}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyEditDialog;
