
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import ProjectExcelData from './ProjectExcelData';
import ProjectFeedback from './ProjectFeedback';
import { motion } from "framer-motion";

interface ProjectTabsProps {
  projectId: string;
  canEdit: boolean;
}

const ProjectTabs = ({ projectId, canEdit }: ProjectTabsProps) => {
  const tabContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: 0.3 
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={tabContainerVariants}
    >
      <Tabs defaultValue="leads" className="w-full relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-600 rounded-full blur-3xl"></div>
        </div>
        
        <TabsList className="grid grid-cols-2 mb-6 bg-gray-100/80 backdrop-blur-sm p-1 rounded-lg">
          <TabsTrigger 
            value="leads" 
            className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-300"
          >
            Leads/Candidates
          </TabsTrigger>
          <TabsTrigger 
            value="feedback"
            className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-300"
          >
            Feedback
          </TabsTrigger>
        </TabsList>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm border border-gray-100">
          <TabsContent value="leads" className="m-0 p-0 focus-visible:outline-none focus-visible:ring-0">
            <ProjectExcelData projectId={projectId} canEdit={canEdit} />
          </TabsContent>
          
          <TabsContent value="feedback" className="m-0 p-0 focus-visible:outline-none focus-visible:ring-0">
            <ProjectFeedback projectId={projectId} />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default ProjectTabs;
