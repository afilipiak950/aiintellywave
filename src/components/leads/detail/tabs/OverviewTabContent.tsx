
import { Lead } from '@/types/lead';
import ContactCard from './overview/ContactCard';
import CompanyCard from './overview/CompanyCard';
import SocialProfiles from './overview/SocialProfiles';
import TagsSection from './overview/TagsSection';
import { getLinkedInUrlFromLead } from '../LeadDetailUtils';

interface OverviewTabContentProps {
  lead: Lead;
  getLinkedInUrl: () => string | null;
}

const OverviewTabContent = ({ lead, getLinkedInUrl }: OverviewTabContentProps) => {
  const linkedInUrl = getLinkedInUrl();
  
  // Check if company information exists
  const hasCompanyInfo = 
    lead.company || 
    lead.extra_data?.["Industry"] || 
    lead.extra_data?.["Company Size"] ||
    lead.extra_data?.["Revenue"];
  
  return (
    <div className="space-y-6">
      {/* Contact Information Card */}
      <ContactCard lead={lead} />
      
      {/* Company Information Card (if data available) */}
      <CompanyCard lead={lead} visible={hasCompanyInfo} />
      
      {/* Social Media Links */}
      <SocialProfiles lead={lead} linkedInUrl={linkedInUrl} />
      
      {/* Tags Section */}
      <TagsSection lead={lead} />
    </div>
  );
};

export default OverviewTabContent;
