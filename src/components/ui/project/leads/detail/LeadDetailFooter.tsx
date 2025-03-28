
import { Button } from "../../../button";

interface LeadDetailFooterProps {
  onClose: () => void;
  canEdit: boolean;
  onConvert?: () => void;
}

const LeadDetailFooter = ({ onClose, canEdit, onConvert }: LeadDetailFooterProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4 border-t">
      <Button onClick={onClose}>Close</Button>
      {canEdit && (
        <Button variant="primary" onClick={onConvert}>
          Convert to Candidate
        </Button>
      )}
    </div>
  );
};

export default LeadDetailFooter;
