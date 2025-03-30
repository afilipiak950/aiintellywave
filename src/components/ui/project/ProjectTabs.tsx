
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import ProjectExcelData from './ProjectExcelData';
import ProjectFeedback from './ProjectFeedback';

interface ProjectTabsProps {
  projectId: string;
  canEdit: boolean;
}

const ProjectTabs = ({ projectId, canEdit }: ProjectTabsProps) => {
  return (
    <Tabs defaultValue="leads" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="leads">Leads/Candidates</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>
      
      <TabsContent value="leads">
        <ProjectExcelData projectId={projectId} canEdit={canEdit} />
      </TabsContent>
      
      <TabsContent value="feedback">
        <ProjectFeedback projectId={projectId} />
      </TabsContent>
    </Tabs>
  );
};

export default ProjectTabs;
