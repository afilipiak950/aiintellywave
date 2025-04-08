
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
  console.log("InviteUserButton render with companyId:", companyId);
  
  const handleClick = () => {
    console.log("InviteUserButton clicked with companyId:", companyId);
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
