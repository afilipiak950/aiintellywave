
import { useState } from 'react';
import { Search, FolderPlus, Filter, ArrowDownUp } from 'lucide-react';
import ProjectCard from '../../components/ui/project/ProjectCard';

const AdminProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Mock project data
  const projects = [
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX principles and improved functionality.',
      client: 'Acme Corporation',
      status: 'in-progress' as const,
      progress: 65,
      startDate: '2023-02-15',
      endDate: '2023-04-30',
    },
    {
      id: '2',
      title: 'Digital Marketing Campaign',
      description: 'Strategic digital marketing campaign across multiple platforms to increase brand awareness and engagement.',
      client: 'XYZ Enterprises',
      status: 'in-progress' as const,
      progress: 40,
      startDate: '2023-03-01',
      endDate: '2023-06-15',
    },
    {
      id: '3',
      title: 'Mobile App Development',
      description: 'Development of a native mobile application for iOS and Android with integration to existing systems.',
      client: 'Global Industries',
      status: 'completed' as const,
      progress: 100,
      startDate: '2022-11-10',
      endDate: '2023-02-28',
    },
    {
      id: '4',
      title: 'Brand Identity Package',
      description: 'Creation of comprehensive brand identity including logo, color palette, typography, and usage guidelines.',
      client: 'Tech Solutions',
      status: 'pending' as const,
      progress: 0,
      startDate: '2023-04-15',
      endDate: '2023-06-30',
    },
    {
      id: '5',
      title: 'Social Media Strategy',
      description: 'Development and implementation of a targeted social media strategy to increase engagement and conversion.',
      client: 'Creative Designs',
      status: 'canceled' as const,
      progress: 25,
      startDate: '2023-01-10',
      endDate: '2023-03-15',
    },
    {
      id: '6',
      title: 'E-commerce Integration',
      description: 'Implementation of e-commerce functionality into the existing website with payment processing and inventory management.',
      client: 'Retail Solutions',
      status: 'completed' as const,
      progress: 100,
      startDate: '2022-12-01',
      endDate: '2023-03-01',
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
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button className="btn-primary inline-flex sm:self-end">
          <FolderPlus size={18} className="mr-2" />
          New Project
        </button>
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
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            filter === 'canceled'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter('canceled')}
        >
          Canceled
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
            We couldn't find any projects matching your search criteria. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
