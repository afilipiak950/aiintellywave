import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Calendar, Clock, Users, FileText } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { ProjectDetails } from '../../../hooks/use-project-detail';
import { motion } from "framer-motion";

interface CompanyUser {
  user_id: string;
  email: string;
  full_name?: string;
}

interface ProjectInfoCardProps {
  project: ProjectDetails;
  isEditing: boolean;
  formData: {
    name: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    assigned_to: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  statusColors: Record<string, string>;
  StatusIcon: LucideIcon;
  availableUsers: CompanyUser[];
}

const ProjectInfoCard = ({ 
  project, 
  isEditing, 
  formData, 
  handleInputChange,
  statusColors,
  StatusIcon,
  availableUsers = []
}: ProjectInfoCardProps) => {
  // Helper to format dates for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString();
  };
  
  // Display name for assigned user
  const getAssignedUserName = () => {
    if (!project.assigned_to) return 'Unassigned';
    const assignedUser = availableUsers.find(user => user.user_id === project.assigned_to);
    return assignedUser ? (assignedUser.full_name || assignedUser.email) : 'Unknown User';
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const iconVariants = {
    hover: { scale: 1.1, transition: { duration: 0.2 } }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className="p-6 overflow-hidden relative bg-gradient-to-br from-white to-gray-50">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/30 rounded-full -translate-y-20 translate-x-20 blur-xl"></div>
        <div className="absolute bottom-0 left-20 w-20 h-20 bg-indigo-50/20 rounded-full translate-y-10 blur-xl"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-6">
            {/* Status Section */}
            <div className="group">
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <motion.div whileHover={iconVariants.hover} className="mr-2 text-indigo-600">
                  <StatusIcon className="h-4 w-4" />
                </motion.div>
                Status
              </h3>
              {isEditing ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2 transition-all hover:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              ) : (
                <div className="flex items-center">
                  <Badge className={`${statusColors[project.status] || 'bg-gray-100'} transition-all duration-300 hover:shadow-md`}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Company Section */}
            <div className="group">
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <motion.div whileHover={iconVariants.hover} className="mr-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                </motion.div>
                Company
              </h3>
              <p className="text-gray-800 transition-colors group-hover:text-indigo-700">{project.company_name}</p>
            </div>
            
            {/* Updated Assigned To Section */}
            <div className="group">
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <motion.div whileHover={iconVariants.hover} className="mr-2 text-green-600">
                  <Users className="h-4 w-4" />
                </motion.div>
                Assigned To
              </h3>
              {isEditing ? (
                <select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2 transition-all hover:border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                >
                  <option value="">Not Assigned</option>
                  {availableUsers.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.full_name || user.email}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800 transition-colors group-hover:text-green-700">
                  {getAssignedUserName()}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Timeline Section */}
            <div className="group">
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <motion.div whileHover={iconVariants.hover} className="mr-2 text-amber-600">
                  <Calendar className="h-4 w-4" />
                </motion.div>
                Timeline
              </h3>
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="w-full border rounded-md p-2 transition-all hover:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="w-full border rounded-md p-2 transition-all hover:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="group-hover:bg-amber-50 p-2 rounded-lg transition-colors">
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="text-gray-800">{formatDate(project.start_date)}</p>
                  </div>
                  <div className="group-hover:bg-amber-50 p-2 rounded-lg transition-colors">
                    <p className="text-xs text-gray-500">End Date</p>
                    <p className="text-gray-800">{formatDate(project.end_date)}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Created Date Section */}
            <div className="group mt-4">
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <motion.div whileHover={iconVariants.hover} className="mr-2 text-purple-600">
                  <Clock className="h-4 w-4" />
                </motion.div>
                Created
              </h3>
              <div className="group-hover:bg-purple-50 p-2 rounded-lg transition-colors inline-block">
                <p className="text-gray-800">{new Date(project.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProjectInfoCard;
