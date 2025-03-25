
import { Separator } from "../separator";
import { useProjectFeedback } from '../../../hooks/use-project-feedback';
import ProjectFeedbackForm from './ProjectFeedbackForm';
import ProjectFeedbackItem from './ProjectFeedbackItem';
import ProjectFeedbackEmpty from './ProjectFeedbackEmpty';

interface ProjectFeedbackProps {
  projectId: string;
}

const ProjectFeedback = ({ projectId }: ProjectFeedbackProps) => {
  const {
    feedback,
    loading,
    newFeedback,
    submitting,
    setNewFeedback,
    handleSubmitFeedback,
    handleDeleteFeedback,
    canDeleteFeedback
  } = useProjectFeedback(projectId);
  
  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewFeedback(e.target.value);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <ProjectFeedbackForm
        newFeedback={newFeedback}
        submitting={submitting}
        onFeedbackChange={handleFeedbackChange}
        onSubmit={handleSubmitFeedback}
      />
      
      <Separator />
      
      {feedback.length === 0 ? (
        <ProjectFeedbackEmpty />
      ) : (
        <div className="space-y-4">
          {feedback.map(item => (
            <ProjectFeedbackItem
              key={item.id}
              feedback={item}
              canDelete={canDeleteFeedback(item.user_id)}
              onDelete={handleDeleteFeedback}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectFeedback;
