
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Folder } from 'lucide-react';

interface ProjectsPageHeaderProps {
  filter: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: string) => void;
  filterTranslations: Record<string, string>;
}

export const ProjectsPageHeader: React.FC<ProjectsPageHeaderProps> = ({
  filter,
  searchTerm,
  onSearchChange,
  onFilterChange,
  filterTranslations,
}) => {
  return (
    <>
      <motion.div 
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="mr-3 bg-indigo-100 p-2 rounded-lg"
          >
            <Folder size={24} className="text-indigo-600" />
          </motion.div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
            Ihre Projekte
          </h1>
        </div>
      </motion.div>
      
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Projekte suchen..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto py-1">
          <Filter className="text-gray-500 mr-1" size={18} />
          
          {Object.entries(filterTranslations).map(([key, label]) => (
            <motion.button
              key={key}
              onClick={() => onFilterChange(key)}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                filter === key 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: filter === key ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </>
  );
};
