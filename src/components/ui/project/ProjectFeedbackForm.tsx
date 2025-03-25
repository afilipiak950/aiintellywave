
import { Send } from 'lucide-react';
import { Button } from "../button";

interface ProjectFeedbackFormProps {
  newFeedback: string;
  submitting: boolean;
  onFeedbackChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProjectFeedbackForm = ({
  newFeedback,
  submitting,
  onFeedbackChange,
  onSubmit
}: ProjectFeedbackFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="new-feedback" className="block font-medium text-gray-700 mb-1">
          Add Feedback
        </label>
        <textarea
          id="new-feedback"
          value={newFeedback}
          onChange={onFeedbackChange}
          rows={3}
          placeholder="Share your thoughts, feedback, or questions about this project..."
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting || !newFeedback.trim()}>
          <Send size={16} className="mr-2" />
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectFeedbackForm;
