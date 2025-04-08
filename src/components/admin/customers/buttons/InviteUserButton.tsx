
import { UserPlus } from "lucide-react";
import ActionButton from "./ActionButton";
import { useActivityTracking } from "@/hooks/use-activity-tracking";

interface InviteUserButtonProps {
  onInviteUser: () => void;
  className?: string;
  companyId?: string;
}

const InviteUserButton = ({ 
  onInviteUser, 
  className = "",
  companyId
}: InviteUserButtonProps) => {
  const { logActivity } = useActivityTracking();
  
  console.log("[InviteUserButton] Rendering with companyId:", companyId);
  
  const handleClick = () => {
    console.log("[InviteUserButton] Clicked with companyId:", companyId);
    
    // Log the action for activity tracking
    if (companyId) {
      logActivity(
        'company', 
        companyId, 
        'opened invite dialog', 
        'Opened user invitation dialog',
        { company_id: companyId }
      );
    }
    
    onInviteUser();
  };
  
  return (
    <ActionButton
      onClick={handleClick}
      icon={UserPlus}
      label="Benutzer einladen"
      className={`bg-indigo-600 hover:bg-indigo-700 text-white ${className}`}
      data-company-id={companyId}
    />
  );
};

export default InviteUserButton;
