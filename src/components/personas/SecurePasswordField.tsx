
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/auth';
import EmailEncryptionIndicator from './EmailEncryptionIndicator';

interface SecurePasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const SecurePasswordField: React.FC<SecurePasswordFieldProps> = ({
  value,
  onChange,
  placeholder = "Password",
  disabled = false,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin';
  
  // Handle password change with animation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only show "encrypting" animation if changing from a non-empty value
    if (value && newValue !== value) {
      setIsEncrypting(true);
      setTimeout(() => {
        setIsEncrypting(false);
        onChange(newValue);
      }, 800);
    } else {
      onChange(newValue);
    }
  };

  const toggleVisibility = () => {
    if (isAdmin) {
      setIsVisible(!isVisible);
    }
  };
  
  return (
    <div className="relative">
      <div className="relative">
        <Input
          type={isVisible ? "text" : "password"}
          value={isEncrypting ? "" : value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled || isEncrypting}
          className={className}
          onFocus={() => {
            // Add a smooth pulse effect to the field on focus
            const input = document.activeElement as HTMLElement;
            input.classList.add('ring-1', 'ring-primary', 'ring-opacity-50');
            setTimeout(() => {
              input.classList.remove('ring-1', 'ring-primary', 'ring-opacity-50');
            }, 300);
          }}
        />
        
        {isEncrypting && (
          <motion.div 
            className="absolute inset-0 bg-muted/20 flex items-center justify-center rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="h-3 w-3 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Re-Encrypting...</span>
            </div>
          </motion.div>
        )}
        
        {isAdmin && value && !disabled && (
          <button 
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      
      <div className="mt-1">
        <EmailEncryptionIndicator 
          isVisible={isVisible}
          isAdmin={isAdmin}
          onToggleVisibility={toggleVisibility}
        />
      </div>
    </div>
  );
};

export default SecurePasswordField;
