
import { useAuth } from '../../../context/auth';
import { useTranslation } from '../../../hooks/useTranslation';

interface WelcomeSectionProps {
  className?: string;
}

const WelcomeSection = ({ className = '' }: WelcomeSectionProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold">{t('welcome')}, {user?.firstName || 'Kunde'}</h1>
      <p className="text-gray-600 mt-1">{t('overview')}</p>
    </div>
  );
};

export default WelcomeSection;
