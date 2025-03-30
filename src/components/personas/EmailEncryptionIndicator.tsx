
import React from 'react';
import { motion } from 'framer-motion';
import { LockKeyhole, EyeOff } from 'lucide-react';

interface EmailEncryptionIndicatorProps {
  isAdmin?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

const EmailEncryptionIndicator: React.FC<EmailEncryptionIndicatorProps> = ({ 
  isAdmin = false, 
  isVisible = false,
  onToggleVisibility 
}) => {
  return (
    <div className="flex items-center space-x-1 text-xs text-gray-500">
      <motion.div 
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <LockKeyhole className="h-3 w-3 text-green-500" />
      </motion.div>
      
      {isAdmin ? (
        <button 
          type="button"
          onClick={onToggleVisibility}
          className="flex items-center text-xs hover:underline"
        >
          {isVisible ? (
            <span className="flex items-center">
              <EyeOff className="h-3 w-3 mr-1" />
              Visible to Admins
            </span>
          ) : (
            <span>Securely encrypted</span>
          )}
        </button>
      ) : (
        <span>Securely encrypted</span>
      )}
    </div>
  );
};

export default EmailEncryptionIndicator;
