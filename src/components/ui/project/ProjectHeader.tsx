
import { MoreVertical } from 'lucide-react';
import { Button } from "../../ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { ProjectDetails } from '../../../hooks/use-project-detail';
import { motion } from "framer-motion";

interface CompanyUser {
  user_id: string;
  email: string;
  full_name?: string;
}

interface ProjectHeaderProps {
  project: ProjectDetails;
  canEdit: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleDelete: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    assigned_to: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  availableUsers: CompanyUser[];
}

const ProjectHeader = ({ 
  project, 
  canEdit, 
  isEditing, 
  setIsEditing, 
  handleDelete,
  handleSubmit,
  formData,
  handleInputChange
}: ProjectHeaderProps) => {
  const headerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="relative overflow-hidden mb-6"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-70 rounded-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/50 rounded-full -translate-y-20 translate-x-20 blur-xl"></div>
        <div className="absolute bottom-0 left-20 w-60 h-60 bg-indigo-100/30 rounded-full translate-y-40 -translate-x-20 blur-xl"></div>
      </div>
      
      <div className="relative z-10 p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <motion.div variants={itemVariants} className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4 w-full">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="text-3xl font-bold border-b border-gray-300 pb-1 w-full focus:outline-none bg-transparent"
                    required
                  />
                </div>
                <div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-2 text-gray-600 bg-white/80 backdrop-blur-sm"
                    rows={3}
                    placeholder="Project description"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="transition-all duration-300 hover:shadow-lg">
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}
                    className="transition-all duration-300 hover:bg-white">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent">
                  {project.name}
                </motion.h1>
                <motion.p variants={itemVariants} className="text-gray-600 mt-2 max-w-2xl leading-relaxed">
                  {project.description || 'No description provided.'}
                </motion.p>
              </>
            )}
          </motion.div>
          
          {canEdit && !isEditing && (
            <motion.div variants={itemVariants} className="mt-4 sm:mt-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-white/80 hover:shadow-sm transition-all">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="animate-in fade-in-50 zoom-in-95 duration-100">
                  <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectHeader;
