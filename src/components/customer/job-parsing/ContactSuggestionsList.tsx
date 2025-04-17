
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Mail, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface ContactSuggestion {
  companyName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  jobTitle: string;
  location: string;
}

interface ContactSuggestionsListProps {
  suggestions: ContactSuggestion[];
}

const ContactSuggestionsList: React.FC<ContactSuggestionsListProps> = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Kontaktvorschläge ({suggestions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="p-4 border rounded-md bg-background">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">{suggestion.companyName}</h3>
                  <p className="text-sm text-muted-foreground">{suggestion.jobTitle} • {suggestion.location}</p>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-primary" />
                    <span>{suggestion.contactPerson}</span>
                  </div>
                  
                  {suggestion.phoneNumber && suggestion.phoneNumber !== 'Nicht angegeben' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{suggestion.phoneNumber}</span>
                    </div>
                  )}
                  
                  {suggestion.email && suggestion.email !== 'Nicht angegeben' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{suggestion.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {suggestion.email && suggestion.email !== 'Nicht angegeben' && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${suggestion.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        E-Mail
                      </a>
                    </Button>
                  )}
                  
                  {suggestion.phoneNumber && suggestion.phoneNumber !== 'Nicht angegeben' && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${suggestion.phoneNumber}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Anrufen
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              
              {index < suggestions.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSuggestionsList;
