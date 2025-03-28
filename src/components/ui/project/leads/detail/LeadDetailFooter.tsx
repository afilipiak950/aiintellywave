
import { Button } from "@/components/ui/button";

interface LeadDetailFooterProps {
  onClose: () => void;
  canEdit: boolean;
  onConvert?: () => void;
}

const LeadDetailFooter = ({ onClose, canEdit, onConvert }: LeadDetailFooterProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4 border-t w-full">
      <Button variant="outline" onClick={onClose}>Close</Button>
      {canEdit && (
        <Button variant="default" onClick={onConvert}>
          Convert to Candidate
        </Button>
      )}
    </div>
  );
};

export default LeadDetailFooter;
