
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  website?: string;
}

interface CompanyEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onCompanyUpdated: () => void;
}

const CompanyEditDialog = ({
  isOpen,
  onClose,
  company,
  onCompanyUpdated
}: CompanyEditDialogProps) => {
  const [formData, setFormData] = useState<Company | null>(company);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update form data when company prop changes
  useEffect(() => {
    setFormData(company);
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the company details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          {formData && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input 
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input 
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input 
                    id="contact_phone"
                    name="contact_phone"
                    value={formData.contact_phone || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description || ''}
                  onChange={handleChange}
                />
              </div>
              
              <DialogFooter className="flex justify-between">
                <Button 
                  type="button" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant="destructive"
                  className="mr-auto flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  Delete Company
                </Button>
                <div>
                  <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting} className="mr-2">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !formData.name}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the company
              "{company?.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Company"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CompanyEditDialog;
