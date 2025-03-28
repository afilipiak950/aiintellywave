
import { Search } from 'lucide-react';
import { Input } from "../../input";
import { motion } from 'framer-motion';

interface LeadsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const LeadsSearch = ({ searchTerm, onSearchChange }: LeadsSearchProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        type="search"
        placeholder="Search leads by name, email, company..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 transition-all duration-200 focus-within:shadow-sm"
      />
    </motion.div>
  );
};

export default LeadsSearch;
