
import { ExcelRow } from '../../../../../types/project';
import LeadProfile from './components/LeadProfile';
import ContactInformation from './components/ContactInformation';
import SocialLinks from './components/SocialLinks';
import AdditionalInformation from './components/AdditionalInformation';
import KeywordTags from './components/KeywordTags';
import SelectedColumnView from './components/SelectedColumnView';

interface LeadDetailContentProps {
  lead: ExcelRow;
  selectedColumn?: string;
}

const LeadDetailContent = ({ lead, selectedColumn }: LeadDetailContentProps) => {
  // If a column is selected, only show that column's data
  if (selectedColumn) {
    return <SelectedColumnView lead={lead} selectedColumn={selectedColumn} />;
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Profile section with photo if available */}
      <LeadProfile lead={lead} />

      {/* Contact information */}
      <ContactInformation lead={lead} />
      
      {/* Social links */}
      <SocialLinks lead={lead} />
      
      {/* Additional information */}
      <AdditionalInformation lead={lead} />
      
      {/* Keywords tags */}
      <KeywordTags lead={lead} />
    </div>
  );
};

export default LeadDetailContent;
