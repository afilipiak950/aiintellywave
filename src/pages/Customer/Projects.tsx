
import { useState } from 'react';
import { Search, Filter, ArrowDownUp } from 'lucide-react';
import ProjectCard from '../../components/ui/project/ProjectCard';

const CustomerProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Mock project data
  const projects = [
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX principles and improved functionality.',
      client: 'Your Company',
      status: 'in-progress' as const,
      progress: 65,
      startDate: '2023-02-15',
      endDate: '2023-04-30',
    },
    {
      id: '2',
      title: 'Social Media Campaign',
      description: 'Strategic social media marketing campaign across multiple platforms to increase brand awareness and engagement.',
      client: 'Your Company',
      status: 'in-progress' as const,
      progress: 40,
      startDate: '2023-03-01',
      endDate: '2023-05-15',
    },
    {
      id: '3',
      title: 'Brand Identity Update',
      description: 'Refreshing your brand identity including logo refinement, updated color palette, and revised usage guidelines.',
      client: 'Your Company',
      status: 'pending' as const,
      progress: 0,
      startDate: '2023-04-10',
      endDate: '2023-06-15',
    },
    {
      id: '4',
      title: 'Email Marketing Series',
      description: 'Development and implementation of a targeted email marketing campaign to nurture leads and increase conversions.',
      client: 'Your Company',
      status: 'completed' as const,
      progress: 100,
      startDate: '2022-12-01',
      endDate: '2023-02-28',
    },
  ];
  
  // Filter and search projects
  const filteredProjects = projects
    .filter(project => 
      filter === 'all' || 
      project.status === filter
    )
    .filter(project => 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <p className="text-gray-600 mt-1">Manage and track all your ongoing projects.</p>
      </div>
      
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
      <div className="flex flex-wrap gap-2">
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
            filter === 'in-progress'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('in-progress')}
        >
          In Progress
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'pending'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
      </div>
      
      {/* Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} onClick={() => console.log('Project clicked:', project.id)} />
        ))}
      </div>
      
      {/* No Results */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500">
            We couldn't find any projects matching your search criteria. Try adjusting your filters or contact your account manager.
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerProjects;
