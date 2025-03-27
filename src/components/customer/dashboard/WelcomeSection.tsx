
import { useAuth } from '../../../context/auth';

interface WelcomeSectionProps {
  className?: string;
}

const WelcomeSection = ({ className = '' }: WelcomeSectionProps) => {
  const { user } = useAuth();
  
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold">Willkommen zurück, {user?.firstName || 'Kunde'}</h1>
      <p className="text-gray-600 mt-1">Hier ist eine Übersicht Ihres Kundenportals.</p>
    </div>
  );
};

export default WelcomeSection;
