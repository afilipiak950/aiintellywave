
import { UICustomer } from '@/types/customer';
import CompanyCard from '../company/CompanyCard';
import { useNavigate } from 'react-router-dom';

interface CompaniesGridProps {
  companies: UICustomer[];
}

const CompaniesGrid = ({ companies }: CompaniesGridProps) => {
  const navigate = useNavigate();

  const handleCompanyClick = (companyId: string) => {
    navigate(`/admin/companies/${companyId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <CompanyCard 
          key={company.id} 
          company={company}
          onClick={() => handleCompanyClick(company.id)}
        />
      ))}
    </div>
  );
};

export default CompaniesGrid;
