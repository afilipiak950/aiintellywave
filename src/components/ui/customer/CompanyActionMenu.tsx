
import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import CompanyEditDialog from '../company/CompanyEditDialog';
import { Company } from '@/services/types/companyTypes';

interface CompanyActionMenuProps {
  company: Company;
  onCompanyUpdated: () => void;
}

const CompanyActionMenu = ({ company, onCompanyUpdated }: CompanyActionMenuProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit Company</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CompanyEditDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        companyId={company.id}
        onCompanyUpdated={onCompanyUpdated}
      />
    </>
  );
};

export default CompanyActionMenu;
