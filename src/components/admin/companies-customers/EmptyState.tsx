
import { Building, Users } from "lucide-react";

interface EmptyStateProps {
  type: 'companies' | 'customers';
  searchTerm?: string;
}

const EmptyState = ({ type, searchTerm }: EmptyStateProps) => {
  const Icon = type === 'companies' ? Building : Users;
  const title = type === 'companies' ? 'No Companies Found' : 'No Customers Found';
  const message = searchTerm 
    ? 'No results match your search criteria' 
    : type === 'companies' ? 'Try adding a company' : 'Try adding a customer';

  return (
    <div className="text-center py-10 border rounded-md">
      <Icon className="h-12 w-12 mx-auto text-muted-foreground" />
      <h3 className="text-lg font-medium mt-3">{title}</h3>
      <p className="text-muted-foreground text-sm mt-1">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
