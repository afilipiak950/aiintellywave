
import { apolloApiKey } from "./config.ts";

interface ApolloPersonSearchParams {
  companyName: string;
  title?: string[];
  roleTypes?: string[];
  page?: number;
  perPage?: number;
}

interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  title: string;
  organization_name: string;
  seniority: string;
  departments: string[];
}

export class ApolloService {
  private baseUrl = "https://api.apollo.io/v1";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!this.apiKey) {
      console.warn("Apollo API Key nicht konfiguriert!");
    }
  }

  async searchHRContacts(params: ApolloPersonSearchParams): Promise<ApolloContact[]> {
    if (!this.apiKey) {
      console.error("Apollo API Key ist nicht konfiguriert");
      return [];
    }

    try {
      console.log(`Suche nach HR-Kontakten für Unternehmen: ${params.companyName}`);

      const searchData = {
        api_key: this.apiKey,
        q_organization_domains: [],
        page: params.page || 1,
        per_page: params.perPage || 10,
        q_organization_name: params.companyName,
        q_titles: [
          "HR", "Human Resources", "Talent", "Recruiter", "Recruiting", 
          "Talent Acquisition", "People", "Personnel", "Hiring"
        ],
        q_role_types: ["HR / RECRUITING"],
      };

      const response = await fetch(`${this.baseUrl}/people/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Apollo API Error: ${response.status}`, errorText);
        return [];
      }

      const data = await response.json();
      console.log(`${data.people?.length || 0} HR-Kontakte gefunden für ${params.companyName}`);
      
      return (data.people || []).map((person: any) => ({
        id: person.id,
        first_name: person.first_name,
        last_name: person.last_name,
        name: `${person.first_name} ${person.last_name}`.trim(),
        email: person.email || null,
        phone: person.phone_number || null,
        linkedin_url: person.linkedin_url || null,
        title: person.title || 'HR',
        organization_name: person.organization?.name || params.companyName,
        seniority: person.seniority || null,
        departments: person.departments || ['Human Resources']
      }));
    } catch (error) {
      console.error("Fehler bei der Apollo API-Anfrage:", error);
      return [];
    }
  }

  async enrichJobWithHRContacts(job: { 
    company: string; 
    title: string;
  }): Promise<{
    hrContacts: Array<{
      full_name: string;
      role: string;
      email?: string;
      phone?: string;
      linkedin_url?: string;
      seniority?: string;
      department?: string;
      source: string;
    }>;
  }> {
    try {
      console.log(`Apollo.io: Suche HR-Kontakte für ${job.company}`);
      
      // Direkte Suche nach HR-Kontakten für das Unternehmen
      const contacts = await this.searchHRContacts({
        companyName: job.company,
        perPage: 5 // Limit auf 5 relevante Kontakte
      });

      // Konvertiere Apollo-Kontakte in unser Format
      const hrContacts = contacts.map(contact => ({
        full_name: contact.name,
        role: contact.title,
        email: contact.email || undefined,
        phone: contact.phone || undefined,
        linkedin_url: contact.linkedin_url || undefined,
        seniority: contact.seniority || undefined,
        department: contact.departments[0] || 'Human Resources',
        source: 'apollo_io'
      }));

      console.log(`${hrContacts.length} HR-Kontakte gefunden für ${job.company}`);
      return { hrContacts };
    } catch (error) {
      console.error(`Fehler beim Anreichern von ${job.company}:`, error);
      return { hrContacts: [] };
    }
  }
}

export function createApolloService(): ApolloService {
  const key = apolloApiKey || '';
  console.log(`Apollo-Service wird initialisiert. API-Key konfiguriert: ${!!key}`);
  return new ApolloService(key);
}
