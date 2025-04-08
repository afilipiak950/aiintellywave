
import { UserPlus } from "lucide-react";
import ActionButton from "./ActionButton";

interface InviteUserButtonProps {
  onInviteUser: () => void;
  className?: string;
}

const InviteUserButton = ({ onInviteUser, className = "" }: InviteUserButtonProps) => {
  return (
    <ActionButton
      onClick={onInviteUser}
      icon={UserPlus}
      label="Benutzer einladen"
      className={`bg-indigo-600 hover:bg-indigo-700 text-white ${className}`}
    />
  );
};

export default InviteUserButton;
