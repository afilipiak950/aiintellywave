
import { Button } from "../../../button";

interface LeadDetailFooterProps {
  onClose: () => void;
  canEdit: boolean;
}

const LeadDetailFooter = ({ onClose, canEdit }: LeadDetailFooterProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4 border-t">
      <Button onClick={onClose}>Close</Button>
      {canEdit && (
        <Button variant="outline">
          Convert to Lead
        </Button>
      )}
    </div>
  );
};

export default LeadDetailFooter;
