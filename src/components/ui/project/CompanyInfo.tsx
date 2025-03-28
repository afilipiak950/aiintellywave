
import React from 'react';

interface CompanyInfoProps {
  company: {
    description?: string;
    contact_email?: string;
    contact_phone?: string;
    city?: string;
    country?: string;
  };
}

const CompanyInfo = ({ company }: CompanyInfoProps) => {
  return (
    <div className="p-4 border-b text-sm text-gray-600">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {company.description && (
          <div>
            <span className="font-medium">Description:</span> {company.description}
          </div>
        )}
        {company.contact_email && (
          <div>
            <span className="font-medium">Email:</span> {company.contact_email}
          </div>
        )}
        {company.contact_phone && (
          <div>
            <span className="font-medium">Phone:</span> {company.contact_phone}
          </div>
        )}
        {(company.city || company.country) && (
          <div>
            <span className="font-medium">Location:</span> {[company.city, company.country].filter(Boolean).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInfo;
