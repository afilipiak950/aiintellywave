
// Apollo.io API Service für HR-Kontakt Enrichment
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

interface ApolloSearchResponse {
  contacts: ApolloContact[];
  pagination: {
    page: number;
    total: number;
    per_page: number;
    has_next_page: boolean;
  };
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

      // Standardwerte für die Suche
      const hrRoleTypes = params.roleTypes || ["HR / RECRUITING"];
      const hrTitles = params.title || [
        "HR", "Human Resources", "Talent", "Recruiter", "Recruiting", 
        "Talent Acquisition", "People", "Personnel", "Hiring"
      ];
      
      const searchData = {
        api_key: this.apiKey,
        q_organization_domains: [],
        page: params.page || 1,
        per_page: params.perPage || 10,
        q_organization_name: params.companyName,
        q_titles: hrTitles,
        q_role_types: hrRoleTypes,
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

      const data = await response.json() as ApolloSearchResponse;
      console.log(`${data.contacts.length} HR-Kontakte gefunden für ${params.companyName}`);
      return data.contacts;
    } catch (error) {
      console.error("Fehler bei der Apollo API-Anfrage:", error);
      return [];
    }
  }

  async enrichJobWithHRContacts(job: { 
    company: string; 
    title: string;
    id?: string;
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
      console.log(`Kontakte anreichern für: ${job.company}, Position: ${job.title}`);
      
      // Suche nach HR-Kontakten für das Unternehmen
      const contacts = await this.searchHRContacts({
        companyName: job.company,
        perPage: 5 // Nur die ersten 5 relevanten Kontakte abrufen
      });

      // Konvertiere und filtere die Apollo-Kontakte in unser Format
      const hrContacts = contacts
        .filter(contact => contact.email || contact.phone || contact.linkedin_url)
        .map(contact => ({
          full_name: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
          role: contact.title || 'HR',
          email: contact.email || undefined,
          phone: contact.phone || undefined,
          linkedin_url: contact.linkedin_url || undefined,
          seniority: contact.seniority || undefined,
          department: contact.departments?.length > 0 ? contact.departments[0] : 'Human Resources',
          source: 'apollo_io'
        }));

      console.log(`${hrContacts.length} gefilterte HR-Kontakte für ${job.company}`);
      return { hrContacts };
    } catch (error) {
      console.error(`Fehler beim Anreichern von ${job.company}:`, error);
      return { hrContacts: [] };
    }
  }
}

// Factory-Funktion für den Apollo-Service
export function createApolloService(): ApolloService {
  return new ApolloService(apolloApiKey || '');
}
