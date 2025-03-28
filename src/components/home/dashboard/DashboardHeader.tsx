
import { motion } from 'framer-motion';

const DashboardHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
        Intelligente KI-Assistenten
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        Interagieren Sie mit unseren spezialisierten KI-Agenten für maximale Produktivität
      </p>
    </motion.div>
  );
};

export default DashboardHeader;
