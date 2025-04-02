
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { CompanyForm } from './CompanyForm';
import { CompanyDeleteConfirmDialog } from './CompanyDeleteConfirmDialog';
import { useCompanyEdit, type Company } from './useCompanyEdit';

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
  const {
    formData,
    isSubmitting,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    handleFormChange,
    handleSubmit,
    handleDelete
  } = useCompanyEdit(company, onCompanyUpdated, onClose);

  // Update form data when company prop changes
  useEffect(() => {
    // The formData state is managed in the useCompanyEdit hook
  }, [company]);

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
              <CompanyForm 
                initialData={formData} 
                onChange={handleFormChange} 
              />
              
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

      <CompanyDeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        companyName={company?.name}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default CompanyEditDialog;
