
// HR-Kontakt Repository für Datenspeicherung
import { supabaseFunctionClient } from "./config.ts";

export interface HRContact {
  id?: string;
  job_offer_id?: string;
  full_name: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  seniority?: string | null;
  department?: string | null;
  source?: string;
  created_at?: string;
}

export interface JobOffer {
  id?: string;
  title: string;
  company_name: string;
  location?: string;
  description?: string;
  url: string;
  source?: string;
}

export class HRContactRepository {
  async saveJobOffer(job: {
    title: string;
    company: string;
    location?: string;
    description?: string;
    url: string;
    source?: string;
  }): Promise<{id: string} | null> {
    try {
      const supabase = await supabaseFunctionClient();
      
      // Debug-Log für die Anfrage
      console.log("Speichere Job-Angebot:", {
        title: job.title,
        company: job.company,
        location: job.location || null,
        source: job.source || 'google_jobs'
      });
      
      const { data, error } = await supabase
        .from('job_offers')
        .insert({
          title: job.title,
          company_name: job.company,
          location: job.location || null,
          description: job.description || null,
          url: job.url,
          source: job.source || 'google_jobs'
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Fehler beim Speichern des Jobs:', error);
        return null;
      }
      
      console.log('Job erfolgreich gespeichert mit ID:', data.id);
      return data as {id: string};
    } catch (err) {
      console.error('Exception beim Speichern des Jobs:', err);
      return null;
    }
  }
  
  async saveHRContacts(contacts: HRContact[]): Promise<number> {
    if (!contacts || contacts.length === 0) {
      return 0;
    }
    
    try {
      const supabase = await supabaseFunctionClient();
      
      // Debug-Log für die Anzahl der zu speichernden Kontakte
      console.log(`Speichere ${contacts.length} HR-Kontakte in die Datenbank`);
      
      // Beispiel Kontakt zur Überprüfung der Daten
      if (contacts.length > 0) {
        console.log('Beispiel-Kontakt:', JSON.stringify(contacts[0]));
      }
      
      const { data, error } = await supabase
        .from('hr_contacts')
        .insert(contacts)
        .select('id');
      
      if (error) {
        console.error('Fehler beim Speichern der HR-Kontakte:', error);
        return 0;
      }
      
      console.log(`${data?.length || 0} HR-Kontakte erfolgreich gespeichert`);
      return data?.length || 0;
    } catch (err) {
      console.error('Exception beim Speichern der HR-Kontakte:', err);
      return 0;
    }
  }
  
  async getHRContactsForJob(jobOfferId: string): Promise<HRContact[]> {
    try {
      const supabase = await supabaseFunctionClient();
      
      console.log(`Suche HR-Kontakte für Job mit ID: ${jobOfferId}`);
      
      const { data, error } = await supabase
        .from('hr_contacts')
        .select('*')
        .eq('job_offer_id', jobOfferId);
      
      if (error) {
        console.error('Fehler beim Abrufen der HR-Kontakte:', error);
        return [];
      }
      
      console.log(`${data.length} HR-Kontakte für Job ${jobOfferId} gefunden`);
      return data as HRContact[];
    } catch (err) {
      console.error('Exception beim Abrufen der HR-Kontakte:', err);
      return [];
    }
  }
  
  async getJobOfferByCompanyAndTitle(company: string, title: string): Promise<JobOffer | null> {
    try {
      const supabase = await supabaseFunctionClient();
      
      console.log(`Suche nach einem Job mit Firma: "${company}" und Titel: "${title}"`);
      
      // Suche nach dem Job mit ungefährer Übereinstimmung
      const { data, error } = await supabase
        .from('job_offers')
        .select('*')
        .ilike('company_name', `%${company}%`)
        .ilike('title', `%${title}%`)
        .limit(1)
        .single();
      
      if (error || !data) {
        console.log(`Kein passender Job gefunden für ${company} - ${title}`);
        return null;
      }
      
      console.log(`Job gefunden: ${data.id} - ${data.company_name} - ${data.title}`);
      return data as JobOffer;
    } catch (err) {
      console.error('Exception beim Suchen des Jobs:', err);
      return null;
    }
  }
}

// Factory-Funktion für das Contact-Repository
export function createHRContactRepository(): HRContactRepository {
  return new HRContactRepository();
}
