
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Key } from 'lucide-react';
import { useAuth } from '@/context/auth';

interface EmailEncryptionIndicatorProps {
  isVisible?: boolean;
  isAdmin?: boolean;
  onToggleVisibility?: () => void;
}

const EmailEncryptionIndicator: React.FC<EmailEncryptionIndicatorProps> = ({ 
  isVisible = false, 
  isAdmin = false,
  onToggleVisibility
}) => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;
  const showAdminControls = isAdmin || userRole === 'admin';
  
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="relative flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute -inset-1"
          animate={{
            background: [
              "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%)",
              "radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0) 80%)",
              "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: isVisible ? [0, 0, 0] : [0, 5, 0, -5, 0]
          }}
          transition={{
            duration: isVisible ? 0 : 1.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          {isVisible ? (
            <Key className="text-amber-500 dark:text-amber-400" size={18} />
          ) : (
            <Lock className="text-emerald-600 dark:text-emerald-500" size={18} />
          )}
        </motion.div>
      </motion.div>
      
      <motion.span 
        className="text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isVisible 
          ? "Credentials visible (admin only)" 
          : "Encrypted: Only you & your Admin can see it"}
      </motion.span>

      {showAdminControls && onToggleVisibility && (
        <motion.button
          className="ml-2 text-xs underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          onClick={onToggleVisibility}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          {isVisible ? "Hide" : "Reveal"} 
        </motion.button>
      )}
    </div>
  );
};

export default EmailEncryptionIndicator;
