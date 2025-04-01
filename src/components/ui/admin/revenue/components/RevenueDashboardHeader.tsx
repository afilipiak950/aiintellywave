
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
      className="flex flex-col space-y-1" // Reduziert den Abstand von space-y-2 auf space-y-1
    >
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1> {/* Reduziert von text-3xl auf text-2xl */}
      <p className="text-sm text-muted-foreground"> {/* Reduziert die Textgröße von text-base auf text-sm */}
        {description}
      </p>
    </motion.div>
  );
};

export default RevenueDashboardHeader;
