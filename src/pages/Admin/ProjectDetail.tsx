
import { useParams } from 'react-router-dom';
import ProjectDetail from '../../components/ui/project/ProjectDetail';

const AdminProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Project ID is required</div>;
  }
  
  return <ProjectDetail projectId={id} />;
};

export default AdminProjectDetail;
