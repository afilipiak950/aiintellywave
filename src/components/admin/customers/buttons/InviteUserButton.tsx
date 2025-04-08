
import { UserPlus } from "lucide-react";
import ActionButton from "./ActionButton";

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
  console.log("[InviteUserButton] Rendering with companyId:", companyId);
  
  const handleClick = () => {
    console.log("[InviteUserButton] Clicked with companyId:", companyId);
    // Add data attributes for easier debugging in DOM
    const eventData = {
      companyId: companyId || 'not-provided',
      timestamp: new Date().toISOString()
    };
    console.log("[InviteUserButton] Event data:", eventData);
    
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
