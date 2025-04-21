
// Service zum Anreichern der Jobs mit HR-Kontakt-Daten
import { createApolloService } from "./apollo-service.ts";
import { createHRContactRepository, HRContact } from "./hr-contact-repository.ts";

export interface Job {
  title: string;
  company: string;
  location?: string;
  description?: string;
  url: string;
  id?: string;
  source?: string;
  hrContacts?: HRContact[];
}

export class ContactEnrichmentService {
  private apolloService = createApolloService();
  private contactRepository = createHRContactRepository();
  
  async enrichJobWithContacts(job: Job): Promise<Job> {
    try {
      console.log(`Starte Enrichment für Job: ${job.title} bei ${job.company}`);
      
      // 1. Prüfen, ob der Job bereits in der Datenbank existiert
      let jobOfferId: string | undefined;
      const existingJob = await this.contactRepository.getJobOfferByCompanyAndTitle(
        job.company, 
        job.title
      );
      
      if (existingJob) {
        jobOfferId = existingJob.id;
        console.log(`Existierender Job gefunden mit ID: ${jobOfferId}`);
        
        // Prüfen, ob bereits HR-Kontakte für diesen Job existieren
        const existingContacts = await this.contactRepository.getHRContactsForJob(jobOfferId);
        
        if (existingContacts.length > 0) {
          console.log(`${existingContacts.length} existierende HR-Kontakte gefunden`);
          job.hrContacts = existingContacts;
          return job;
        }
      }
      
      // 2. Wenn kein existierender Job mit Kontakten gefunden wurde, neuen Job speichern
      if (!jobOfferId) {
        const savedJob = await this.contactRepository.saveJobOffer({
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          url: job.url,
          source: job.source || 'google_jobs'
        });
        
        if (savedJob) {
          jobOfferId = savedJob.id;
          console.log(`Neuer Job gespeichert mit ID: ${jobOfferId}`);
        }
      }
      
      // 3. Kontakte über Apollo.io anreichern
      console.log(`Suche HR-Kontakte für ${job.company} via Apollo.io`);
      const { hrContacts } = await this.apolloService.enrichJobWithHRContacts(job);
      
      // 4. Kontakte mit Job-ID verknüpfen und speichern
      if (jobOfferId && hrContacts.length > 0) {
        const contactsWithJobId = hrContacts.map(contact => ({
          ...contact,
          job_offer_id: jobOfferId
        }));
        
        const savedCount = await this.contactRepository.saveHRContacts(contactsWithJobId);
        console.log(`${savedCount} HR-Kontakte gespeichert für Job ${jobOfferId}`);
      }
      
      // 5. Kontakte zum Job-Objekt hinzufügen und zurückgeben
      job.hrContacts = hrContacts;
      return job;
    } catch (error) {
      console.error(`Fehler beim Anreichern des Jobs ${job.title}:`, error);
      return job;
    }
  }
  
  async enrichJobsWithContacts(jobs: Job[]): Promise<Job[]> {
    console.log(`Starte Batch-Enrichment für ${jobs.length} Jobs`);
    
    const enrichedJobs: Job[] = [];
    for (const job of jobs) {
      try {
        const enrichedJob = await this.enrichJobWithContacts(job);
        enrichedJobs.push(enrichedJob);
      } catch (err) {
        console.error(`Fehler beim Anreichern eines Jobs im Batch:`, err);
        enrichedJobs.push(job); // Original-Job trotzdem behalten
      }
    }
    
    console.log(`Batch-Enrichment abgeschlossen: ${enrichedJobs.length} Jobs verarbeitet`);
    return enrichedJobs;
  }
}

// Factory-Funktion für den Enrichment-Service
export function createContactEnrichmentService(): ContactEnrichmentService {
  return new ContactEnrichmentService();
}
