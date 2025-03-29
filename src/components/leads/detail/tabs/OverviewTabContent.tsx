
import { Lead } from '@/types/lead';
import { motion } from "framer-motion";
import { Mail, Phone, Globe, MapPin, Building, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OverviewTabContentProps {
  lead: Lead;
  getLinkedInUrl: () => string | null;
}

const OverviewTabContent = ({ lead, getLinkedInUrl }: OverviewTabContentProps) => {
  const linkedInUrl = getLinkedInUrl();
  
  return (
    <div className="space-y-6">
      {/* Contact Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <h3 className="text-base font-semibold mb-3 flex items-center">
          <Mail className="h-4 w-4 mr-2 text-blue-500" />
          Contact Information
        </h3>
        <div className="space-y-3">
          {lead.email && (
            <div className="flex items-center group">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <a 
                href={`mailto:${lead.email}`} 
                className="text-blue-600 hover:text-blue-700 hover:underline group-hover:translate-x-0.5 transition-transform"
              >
                {lead.email}
              </a>
            </div>
          )}
          
          {lead.phone && (
            <div className="flex items-center group">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                <Phone className="h-4 w-4 text-green-500" />
              </div>
              <a 
                href={`tel:${lead.phone}`} 
                className="text-blue-600 hover:text-blue-700 hover:underline group-hover:translate-x-0.5 transition-transform"
              >
                {lead.phone}
              </a>
            </div>
          )}
          
          {lead.extra_data?.["Website"] && (
            <div className="flex items-center group">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                <Globe className="h-4 w-4 text-purple-500" />
              </div>
              <a 
                href={lead.extra_data["Website"].startsWith('http') ? lead.extra_data["Website"] : `https://${lead.extra_data["Website"]}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline flex items-center group-hover:translate-x-0.5 transition-transform"
              >
                {lead.extra_data["Website"]}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}
          
          {(lead.extra_data?.["Location"] || lead.extra_data?.["City"] || lead.extra_data?.["Country"]) && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                <MapPin className="h-4 w-4 text-amber-500" />
              </div>
              <span>
                {[
                  lead.extra_data?.["Location"], 
                  lead.extra_data?.["City"], 
                  lead.extra_data?.["Country"]
                ].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Company Information Card (if data available) */}
      {(lead.company || lead.extra_data?.["Industry"] || lead.extra_data?.["Company Size"]) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-base font-semibold mb-3 flex items-center">
            <Building className="h-4 w-4 mr-2 text-indigo-500" />
            Company Information
          </h3>
          <div className="space-y-3">
            {lead.company && (
              <div className="flex items-start">
                <span className="text-sm text-muted-foreground w-32">Company:</span>
                <span className="font-medium">{lead.company}</span>
              </div>
            )}
            
            {lead.extra_data?.["Industry"] && (
              <div className="flex items-start">
                <span className="text-sm text-muted-foreground w-32">Industry:</span>
                <span>{lead.extra_data["Industry"]}</span>
              </div>
            )}
            
            {lead.extra_data?.["Company Size"] && (
              <div className="flex items-start">
                <span className="text-sm text-muted-foreground w-32">Company Size:</span>
                <span>{lead.extra_data["Company Size"]}</span>
              </div>
            )}
            
            {lead.extra_data?.["Revenue"] && (
              <div className="flex items-start">
                <span className="text-sm text-muted-foreground w-32">Revenue:</span>
                <span>{lead.extra_data["Revenue"]}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Social Media Links */}
      {(linkedInUrl || lead.extra_data?.["Facebook"] || lead.extra_data?.["Twitter"]) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Social Profiles</h3>
          <div className="flex gap-2 flex-wrap">
            {linkedInUrl && (
              <motion.a
                href={linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-md hover:bg-[#0077B5]/90 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                View on LinkedIn
              </motion.a>
            )}
            
            {lead.extra_data?.["Facebook"] && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                asChild
              >
                <a 
                  href={lead.extra_data["Facebook"].startsWith('http') ? lead.extra_data["Facebook"] : `https://${lead.extra_data["Facebook"]}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook text-[#1877F2]">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  Facebook
                </a>
              </Button>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Tags Section */}
      {lead.tags && lead.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Tags</h3>
          <div className="flex flex-wrap gap-1">
            {lead.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-slate-100">
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OverviewTabContent;
