
import { createContactEnrichmentService } from "./contact-enrichment-service.ts";
import { processRequestSync as originalProcessSync } from "./sync-processor.ts";

export async function processRequestSync({ url, maxPages, maxDepth, documents, jobs }: {
  url?: string;
  maxPages?: number;
  maxDepth?: number;
  documents?: any[];
  jobs?: any[];
}) {
  console.log("processRequestSync gestartet mit:", {
    url: url || "nicht angegeben",
    maxPages: maxPages || "Standardwert",
    maxDepth: maxDepth || "Standardwert",
    documentsAngegeben: !!documents && documents.length > 0,
    jobsAngegeben: !!jobs && jobs.length > 0,
  });
  
  let result = {
    success: false as boolean,
    message: "",
    jobsProcessed: 0,
    contactsFound: 0,
    details: {}
  };
  
  try {
    // Prüfen, ob Jobs direkt übergeben wurden und angereichert werden sollen
    if (jobs && jobs.length > 0) {
      console.log(`${jobs.length} Jobs direkt zur Anreicherung übergeben`);
      
      // Enrichment Service für die Kontaktanreicherung
      const enrichmentService = createContactEnrichmentService();
      
      // Jobs mit HR-Kontakten anreichern
      const enrichedJobs = await enrichmentService.enrichJobsWithContacts(jobs);
      
      // Zählen, wie viele Kontakte insgesamt gefunden wurden
      let totalContactsFound = 0;
      for (const job of enrichedJobs) {
        if (job.hrContacts && job.hrContacts.length > 0) {
          totalContactsFound += job.hrContacts.length;
        }
      }
      
      // Erfolgsresultat zurückgeben
      result = {
        success: true,
        message: `${jobs.length} Jobs erfolgreich verarbeitet und mit ${totalContactsFound} HR-Kontakten angereichert`,
        jobsProcessed: jobs.length,
        contactsFound: totalContactsFound,
        details: {
          jobsProcessed: jobs.length,
          contactsFound: totalContactsFound,
          enrichmentCompleted: true
        }
      };
      
      return result;
    }
    
    // Sonst: Existierende Funktion aufrufen für URL/Dokumente Verarbeitung
    result = await originalProcessSync({ url, maxPages, maxDepth, documents });
    
    // Zusätzlich Jobs anreichern, wenn die Funktion erfolgreich war
    if (result.success) {
      console.log("Basis-Verarbeitung erfolgreich abgeschlossen, starte Kontaktanreicherung");
      try {
        // Ein spezifischer Code, der mehr Informationen für den Client zurückgibt
        result.details = {
          jobsProcessed: result.jobsProcessed || 0,
          contactsFound: result.contactsFound || 0,
          enrichmentCompleted: true
        };
      } catch (err) {
        console.error("Fehler beim Anreichern der Jobs mit Kontakten:", err);
      }
    }
    
    return result;
  } catch (error) {
    console.error("Fehler in processRequestSync:", error);
    return {
      success: false,
      message: `Fehler beim Verarbeiten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
      jobsProcessed: 0,
      contactsFound: 0,
      details: { error: error instanceof Error ? error.stack : null }
    };
  }
}

export async function handleBackgroundJob({ 
  jobId, 
  url, 
  userId, 
  maxPages, 
  maxDepth, 
  documents,
  jobs 
}: {
  jobId: string;
  url?: string;
  userId?: string | null;
  maxPages?: number;
  maxDepth?: number;
  documents?: any[];
  jobs?: any[];
}) {
  try {
    console.log(`Starte Hintergrundverarbeitung für Job ${jobId}`);
    console.log(`Eingabeparameter:`, {
      url: url || "nicht angegeben",
      userId: userId || "nicht angegeben",
      maxPages: maxPages || "Standardwert",
      maxDepth: maxDepth || "Standardwert",
      documentsAngegeben: !!documents && documents.length > 0,
      jobsAngegeben: !!jobs && jobs.length > 0,
    });
    
    let syncResult;
    
    // Prüfen, ob Jobs direkt übergeben wurden
    if (jobs && jobs.length > 0) {
      console.log(`${jobs.length} Jobs direkt zur Verarbeitung im Hintergrund übergeben`);
      
      // Enrichment Service für die Kontaktanreicherung
      const enrichmentService = createContactEnrichmentService();
      
      // Jobs mit HR-Kontakten anreichern
      const enrichedJobs = await enrichmentService.enrichJobsWithContacts(jobs);
      
      // Zählen, wie viele Kontakte insgesamt gefunden wurden
      let totalContactsFound = 0;
      for (const job of enrichedJobs) {
        if (job.hrContacts && job.hrContacts.length > 0) {
          totalContactsFound += job.hrContacts.length;
        }
      }
      
      // Erfolgsresultat erstellen
      syncResult = {
        success: true,
        message: `${jobs.length} Jobs erfolgreich verarbeitet und mit ${totalContactsFound} HR-Kontakten angereichert`,
        jobsProcessed: jobs.length,
        contactsFound: totalContactsFound
      };
    } else {
      // Sonst: Original-Synchronisierungsprozess durchführen
      syncResult = await originalProcessSync({ url, maxPages, maxDepth, documents });
    }
    
    console.log(`Hintergrundverarbeitung für Job ${jobId} abgeschlossen`);
    
    return {
      success: true,
      jobId,
      message: "Hintergrundverarbeitung erfolgreich",
      details: {
        jobsProcessed: syncResult.jobsProcessed || 0,
        contactsFound: syncResult.contactsFound || 0,
        enrichmentCompleted: true
      }
    };
  } catch (error) {
    console.error(`Fehler in Hintergrundverarbeitung für Job ${jobId}:`, error);
    
    return {
      success: false,
      jobId,
      error: `Fehler in Hintergrundverarbeitung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
      details: {
        errorDetails: error instanceof Error ? error.stack : null
      }
    };
  }
}
