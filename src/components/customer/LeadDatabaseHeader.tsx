
import { motion } from 'framer-motion';

interface LeadDatabaseHeaderProps {
  title?: string;
  subtitle?: string;
}

const LeadDatabaseHeader = ({ 
  title = "Lead Database", 
  subtitle = "Manage and track all leads across your projects" 
}: LeadDatabaseHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
        {title}
      </h1>
      <p className="text-muted-foreground mt-1">
        {subtitle}
      </p>
    </motion.div>
  );
};

export default LeadDatabaseHeader;
