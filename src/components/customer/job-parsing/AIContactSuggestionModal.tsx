
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Mail, Phone, Linkedin, Globe, User, Building, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface AIContactSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: any;
}

const AIContactSuggestionModal: React.FC<AIContactSuggestionModalProps> = ({
  isOpen,
  onClose,
  suggestion
}) => {
  // Copy suggestion to clipboard
  const copyToClipboard = (text: string, label: string = 'Kontaktvorschlag') => {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "In Zwischenablage kopiert",
          description: `${label} wurde in die Zwischenablage kopiert.`,
          variant: "default"
        });
      })
      .catch(() => {
        toast({
          title: "Fehler beim Kopieren",
          description: "Der Text konnte nicht in die Zwischenablage kopiert werden.",
          variant: "destructive"
        });
      });
  };

  // Open LinkedIn profile in a new tab
  const openLinkedIn = (url: string) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  // Open website in a new tab
  const openWebsite = (url: string) => {
    if (!url) return;
    
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }
    
    window.open(fullUrl, '_blank');
  };

  // Send email
  const sendEmail = (email: string) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

  // Call phone number
  const callPhone = (phone: string) => {
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  if (!suggestion) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KI-Kontaktvorschlag</DialogTitle>
            <DialogDescription>
              Keine Kontaktinformationen verfügbar. Bitte versuchen Sie es später erneut.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Access the contact data from the suggestion
  const contact = suggestion.hr_contact || {};
  const company = suggestion.company || {};
  const job = suggestion.job || {};
  const emailTemplate = suggestion.email_template || '';
  const metadata = suggestion.metadata || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KI-Kontaktvorschlag</DialogTitle>
          <DialogDescription>
            Basierend auf den Jobangeboten wurden potenzielle Kontaktpersonen im HR-Bereich identifiziert.
            {metadata.source && (
              <Badge variant="outline" className="ml-2 mt-1">
                Quelle: {metadata.source}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          {/* Contact Information Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" /> Kontaktperson
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{contact.name || 'HR Manager'}</h3>
                  <p className="text-sm text-muted-foreground">{contact.position || 'Human Resources'}</p>
                </div>
                
                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-sm">{contact.email}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => sendEmail(contact.email)}>
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(contact.email, 'E-Mail')}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {contact.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-sm">{contact.phone}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => callPhone(contact.phone)}>
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(contact.phone, 'Telefon')}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {contact.linkedin && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-primary" />
                        <span className="text-sm truncate max-w-[180px]">LinkedIn Profil</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openLinkedIn(contact.linkedin)}>
                        <Linkedin className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Company Information Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-4 w-4" /> Unternehmen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{company.name || 'Unternehmen'}</h3>
                  <p className="text-sm text-muted-foreground">{job.title || 'Position'}</p>
                </div>
                
                <div className="space-y-2">
                  {company.website && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="text-sm truncate max-w-[180px]">{company.website}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openWebsite(company.website)}>
                        <Globe className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                  
                  {company.linkedin && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-primary" />
                        <span className="text-sm truncate max-w-[180px]">LinkedIn Seite</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openLinkedIn(company.linkedin)}>
                        <Linkedin className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="pt-2 flex flex-wrap gap-2">
                  {metadata.enrichment_id && (
                    <Badge variant="outline" className="text-xs">
                      Clay Enrichment
                    </Badge>
                  )}
                  {metadata.confidence_score && (
                    <Badge variant="outline" className="text-xs">
                      Konfidenz: {Math.round(metadata.confidence_score * 100)}%
                    </Badge>
                  )}
                  {metadata.generated_at && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1 inline" />
                      {new Date(metadata.generated_at).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Separator className="my-2" />
        
        {/* Email Template */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">E-Mail Vorlage</h3>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {emailTemplate}
              </pre>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Schließen</Button>
          <Button onClick={() => copyToClipboard(emailTemplate, 'E-Mail Vorlage')}>
            <Copy className="h-4 w-4 mr-2" />
            E-Mail kopieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIContactSuggestionModal;
