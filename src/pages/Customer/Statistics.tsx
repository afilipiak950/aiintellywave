
import { lazy } from 'react';

// Lazy load the StatisticsComingSoon component
const StatisticsComingSoon = lazy(() => import('../Statistics/StatisticsComingSoon'));

const CustomerStatistics = () => {
  return <StatisticsComingSoon />;
};

export default CustomerStatistics;
