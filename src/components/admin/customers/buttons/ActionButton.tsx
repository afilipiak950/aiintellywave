
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
  icon?: LucideIcon;
  label: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
  disabled?: boolean;
}

const ActionButton = ({ 
  onClick, 
  icon: Icon, 
  label, 
  variant = "default",
  className = "",
  disabled = false
}: ActionButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      variant={variant}
      className={`flex items-center gap-2 ${className}`}
      disabled={disabled}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Button>
  );
};

export default ActionButton;
