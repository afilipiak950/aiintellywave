
import React from 'react';
import { Database, Upload } from 'lucide-react';

interface LeadMigrationIconProps {
  className?: string;
  size?: number;
}

const LeadMigrationIcon = ({ className = "", size = 16 }: LeadMigrationIconProps) => {
  return (
    <div className="relative inline-flex">
      <Database className={`${className} text-primary`} size={size} />
      <Upload 
        className={`absolute -top-1 -right-1 text-primary-foreground bg-primary rounded-full p-0.5 ${className}`}
        size={size * 0.75}
      />
    </div>
  );
};

export default LeadMigrationIcon;
