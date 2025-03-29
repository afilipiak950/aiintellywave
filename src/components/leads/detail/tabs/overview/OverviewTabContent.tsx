
import { Lead } from '@/types/lead';
import ContactCard from './ContactCard';
import CompanyCard from './CompanyCard';
import SocialProfiles from './SocialProfiles';
import TagsSection from './TagsSection';
import { 
  getLinkedInUrlFromLead, 
  getEducationFromLead, 
  getExperienceFromLead,
  getSkillsFromLead
} from '../../LeadDetailUtils';
import { Book, Briefcase, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

interface OverviewTabContentProps {
  lead: Lead;
  getLinkedInUrl: () => string | null;
}

const OverviewTabContent = ({ lead, getLinkedInUrl }: OverviewTabContentProps) => {
  const linkedInUrl = getLinkedInUrl();
  const education = getEducationFromLead(lead);
  const experience = getExperienceFromLead(lead);
  const skills = getSkillsFromLead(lead);
  
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
      
      {/* Work Experience - New Section */}
      {experience && experience.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border bg-card p-4"
        >
          <div className="flex items-center mb-3">
            <Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
            <h3 className="text-lg font-medium">Experience</h3>
          </div>
          
          <div className="space-y-3">
            {experience.map((exp, index) => (
              <div key={`exp-${index}`} className="border-l-2 border-muted pl-3">
                <p className="font-medium">{exp.title} at {exp.company}</p>
                <p className="text-sm text-muted-foreground">{exp.duration}</p>
                {exp.description && (
                  <p className="text-sm mt-1">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Education - New Section */}
      {education && education.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border bg-card p-4"
        >
          <div className="flex items-center mb-3">
            <GraduationCap className="h-5 w-5 mr-2 text-muted-foreground" />
            <h3 className="text-lg font-medium">Education</h3>
          </div>
          
          <div className="space-y-3">
            {education.map((edu, index) => (
              <div key={`edu-${index}`} className="border-l-2 border-muted pl-3">
                <p className="font-medium">{edu.institution}</p>
                <p className="text-sm">{edu.degree}</p>
                <p className="text-sm text-muted-foreground">{edu.year}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Skills - New Section */}
      {skills && skills.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border bg-card p-4"
        >
          <div className="flex items-center mb-3">
            <Book className="h-5 w-5 mr-2 text-muted-foreground" />
            <h3 className="text-lg font-medium">Skills</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span 
                key={`skill-${index}`} 
                className="bg-secondary px-2 py-1 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Tags Section */}
      <TagsSection lead={lead} />
    </div>
  );
};

export default OverviewTabContent;
