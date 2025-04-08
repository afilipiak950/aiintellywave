
import { UserPlus } from "lucide-react";
import ActionButton from "./ActionButton";

interface InviteUserButtonProps {
  onInviteUser: () => void;
  className?: string;
  companyId?: string; // Add companyId prop
}

const InviteUserButton = ({ 
  onInviteUser, 
  className = "",
  companyId // Accept the companyId
}: InviteUserButtonProps) => {
  console.log("InviteUserButton received companyId:", companyId); // Debug log
  
  return (
    <ActionButton
      onClick={onInviteUser}
      icon={UserPlus}
      label="Benutzer einladen"
      className={`bg-indigo-600 hover:bg-indigo-700 text-white ${className}`}
      data-company-id={companyId} // Store companyId as a data attribute for debugging
    />
  );
};

export default InviteUserButton;
