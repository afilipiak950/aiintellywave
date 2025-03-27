
import { lazy } from 'react';

// Lazy load the OutreachComingSoon component
const OutreachComingSoon = lazy(() => import('../Outreach/OutreachComingSoon'));

const CustomerOutreach = () => {
  return <OutreachComingSoon />;
};

export default CustomerOutreach;
