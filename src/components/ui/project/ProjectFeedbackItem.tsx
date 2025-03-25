
import { Trash2 } from 'lucide-react';
import { Button } from "../button";
import { Card } from "../card";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Feedback } from '../../../types/project';

interface ProjectFeedbackItemProps {
  feedback: Feedback;
  canDelete: boolean;
  onDelete: (id: string) => void;
}

const ProjectFeedbackItem = ({
  feedback,
  canDelete,
  onDelete
}: ProjectFeedbackItemProps) => {
  return (
    <Card className="p-4">
      <div className="flex space-x-3">
        <Avatar className="h-10 w-10">
          {feedback.user_avatar ? (
            <AvatarImage src={feedback.user_avatar} alt={feedback.user_name} />
          ) : (
            <AvatarFallback>{feedback.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{feedback.user_name}</p>
              <p className="text-xs text-gray-500">{new Date(feedback.created_at).toLocaleString()}</p>
            </div>
            
            {canDelete && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(feedback.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
          
          <div className="mt-2 text-gray-700 whitespace-pre-line">
            {feedback.content}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectFeedbackItem;
