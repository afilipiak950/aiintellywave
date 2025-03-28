
import { Button } from "@/components/ui/button";

interface LeadDetailFooterProps {
  onClose: () => void;
  canEdit: boolean;
  onConvertLead?: () => void;
}

const LeadDetailFooter = ({ 
  onClose, 
  canEdit, 
  onConvertLead 
}: LeadDetailFooterProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4 border-t">
      <Button onClick={onClose}>Close</Button>
      {canEdit && (
        <Button 
          variant="outline" 
          onClick={onConvertLead}
        >
          Convert to Lead
        </Button>
      )}
    </div>
  );
};

export default LeadDetailFooter;
