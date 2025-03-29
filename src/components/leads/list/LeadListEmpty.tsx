
import { motion } from "framer-motion";

const LeadListEmpty = () => {
  return (
    <motion.div 
      className="text-center py-16 px-4 bg-gradient-to-tr from-slate-50 to-gray-50 rounded-xl border border-slate-100 shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-medium text-gray-900 mb-2">
        No leads found
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Try adjusting your search or filter criteria, or create a new lead using the "Add New Lead" button.
      </p>
    </motion.div>
  );
};

export default LeadListEmpty;
