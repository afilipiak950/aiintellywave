
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  website?: string;
}

export const useCompanyEdit = (
  company: Company | null,
  onCompanyUpdated: () => void,
  onClose: () => void
) => {
  const [formData, setFormData] = useState<Company | null>(company);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFormChange = (updatedData: Company) => {
    setFormData(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !formData.id) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          description: formData.description,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          city: formData.city,
          country: formData.country,
          website: formData.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.id);
      
      if (error) throw error;
      
      toast({
        title: "Company updated",
        description: "The company information has been updated successfully.",
      });
      
      onCompanyUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update company',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!company || !company.id) return;
    
    try {
      setIsDeleting(true);
      
      // First check if there are any users associated with this company
      const { data: companyUsers, error: usersError } = await supabase
        .from('company_users')
        .select('id')
        .eq('company_id', company.id);
      
      if (usersError) throw usersError;
      
      if (companyUsers && companyUsers.length > 0) {
        toast({
          title: "Cannot delete company",
          description: "This company has associated users. Please remove all users first.",
          variant: "destructive"
        });
        setIsDeleteDialogOpen(false);
        return;
      }
      
      // Then check if there are any projects for this company
      const { data: companyProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('company_id', company.id);
      
      if (projectsError) throw projectsError;
      
      if (companyProjects && companyProjects.length > 0) {
        toast({
          title: "Cannot delete company",
          description: "This company has associated projects. Please delete all projects first.",
          variant: "destructive"
        });
        setIsDeleteDialogOpen(false);
        return;
      }
      
      // If no users or projects are associated, proceed with deletion
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);
      
      if (deleteError) throw deleteError;
      
      toast({
        title: "Company deleted",
        description: "The company has been successfully deleted.",
      });
      
      onCompanyUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete company',
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return {
    formData,
    isSubmitting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    handleFormChange,
    handleSubmit,
    handleDelete
  };
};
