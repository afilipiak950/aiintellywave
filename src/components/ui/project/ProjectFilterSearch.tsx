
import { Search, Filter, ArrowDownUp } from 'lucide-react';

interface ProjectFilterSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
}

const ProjectFilterSearch = ({ 
  searchTerm, 
  setSearchTerm, 
  filter, 
  setFilter 
}: ProjectFilterSearchProps) => {
  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="relative inline-block">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter size={16} className="mr-2" />
              Filter
            </button>
          </div>
          
          <div className="relative inline-block">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ArrowDownUp size={16} className="mr-2" />
              Sort
            </button>
          </div>
        </div>
      </div>
      
      {/* Filter Pills */}
      <div className="flex items-center space-x-2">
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'completed'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>
    </>
  );
};

export default ProjectFilterSearch;
