
import { UserPlus } from "lucide-react";
import ActionButton from "./ActionButton";

interface InviteUserButtonProps {
  onInviteUser: () => void;
}

const InviteUserButton = ({ onInviteUser }: InviteUserButtonProps) => {
  return (
    <ActionButton
      onClick={onInviteUser}
      icon={UserPlus}
      label="Benutzer einladen"
      className="bg-indigo-600 hover:bg-indigo-700 text-white"
    />
  );
};

export default InviteUserButton;
