
import { Button } from "../../ui/button";

interface ManagerProjectsHeaderProps {
  onCreateClick: () => void;
}

const ManagerProjectsHeader = ({ onCreateClick }: ManagerProjectsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-gray-500">Manage your company's projects</p>
      </div>
      <Button onClick={onCreateClick}>Create Project</Button>
    </div>
  );
};

export default ManagerProjectsHeader;
