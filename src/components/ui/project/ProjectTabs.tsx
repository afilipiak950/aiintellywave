
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import ProjectMilestones from './ProjectMilestones';
import ProjectFeedback from './ProjectFeedback';
import ProjectFiles from './ProjectFiles';
import ProjectExcelData from './ProjectExcelData';

interface ProjectTabsProps {
  projectId: string;
  canEdit: boolean;
}

const ProjectTabs = ({ projectId, canEdit }: ProjectTabsProps) => {
  return (
    <Tabs defaultValue="milestones" className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="milestones">Milestones & Tasks</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="excel">Excel Data</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>
      
      <TabsContent value="milestones">
        <ProjectMilestones projectId={projectId} canEdit={canEdit} />
      </TabsContent>
      
      <TabsContent value="files">
        <ProjectFiles projectId={projectId} canEdit={canEdit} />
      </TabsContent>
      
      <TabsContent value="excel">
        <ProjectExcelData projectId={projectId} canEdit={canEdit} />
      </TabsContent>
      
      <TabsContent value="feedback">
        <ProjectFeedback projectId={projectId} />
      </TabsContent>
    </Tabs>
  );
};

export default ProjectTabs;
