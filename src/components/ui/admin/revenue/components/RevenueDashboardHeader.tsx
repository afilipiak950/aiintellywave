
import { motion } from 'framer-motion';

interface RevenueDashboardHeaderProps {
  title: string;
  description: string;
}

const RevenueDashboardHeader = ({ 
  title = "Revenue Dashboard", 
  description = "Manage and track all customer revenue, appointments, and recurring income."
}: RevenueDashboardHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col space-y-2"
    >
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
};

export default RevenueDashboardHeader;
