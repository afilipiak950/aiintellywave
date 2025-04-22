
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
      console.log(`Apollo.io API Request - Searching HR contacts for company: ${params.companyName}`);

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

      console.log('Apollo.io API Request payload:', JSON.stringify(searchData, null, 2));

      const response = await fetch(`${this.baseUrl}/people/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchData),
      });

      const status = response.status;
      console.log(`Apollo.io API Response Status: ${status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Apollo.io API Error Response:', {
          status,
          error: errorText,
          company: params.companyName
        });
        return [];
      }

      const data = await response.json();
      console.log(`Apollo.io API Success - Found ${data.people?.length || 0} HR contacts for ${params.companyName}`);
      
      if (data.people && data.people.length > 0) {
        console.log('Apollo.io API Sample Contact:', {
          first_name: data.people[0].first_name,
          title: data.people[0].title,
          organization: data.people[0].organization?.name
        });
      }

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
      console.error('Apollo.io API Exception:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        company: params.companyName,
        stack: error instanceof Error ? error.stack : undefined
      });
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
      console.log(`Apollo.io Enrichment Request - Company: ${job.company}, Job Title: ${job.title}`);
      
      const contacts = await this.searchHRContacts({
        companyName: job.company,
        perPage: 5
      });

      console.log(`Apollo.io Enrichment Results - Found ${contacts.length} contacts for ${job.company}`);

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

      if (hrContacts.length > 0) {
        console.log('Apollo.io Sample Enriched Contact:', {
          name: hrContacts[0].full_name,
          role: hrContacts[0].role,
          has_email: !!hrContacts[0].email,
          has_phone: !!hrContacts[0].phone
        });
      }

      return { hrContacts };
    } catch (error) {
      console.error('Apollo.io Enrichment Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        company: job.company,
        title: job.title,
        stack: error instanceof Error ? error.stack : undefined
      });
      return { hrContacts: [] };
    }
  }
}

export function createApolloService(): ApolloService {
  const key = apolloApiKey || '';
  console.log(`Apollo-Service wird initialisiert. API-Key konfiguriert: ${!!key}`);
  return new ApolloService(key);
}
