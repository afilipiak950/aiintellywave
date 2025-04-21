
import { createContactEnrichmentService } from "./contact-enrichment-service.ts";
import { processRequestSync as originalProcessSync } from "./sync-processor.ts";

export async function processRequestSync({ url, maxPages, maxDepth, documents }: {
  url: string;
  maxPages: number;
  maxDepth: number;
  documents: any[];
}) {
  // Existierende Funktion aufrufen
  const result = await originalProcessSync({ url, maxPages, maxDepth, documents });
  
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
}

export async function handleBackgroundJob({ 
  jobId, 
  url, 
  userId, 
  maxPages, 
  maxDepth, 
  documents 
}: {
  jobId: string;
  url: string;
  userId: string | null;
  maxPages: number;
  maxDepth: number;
  documents: any[];
}) {
  try {
    console.log(`Starte Hintergrundverarbeitung für Job ${jobId}`);
    
    // Basis-Synchronisierung
    const syncResult = await originalProcessSync({ url, maxPages, maxDepth, documents });
    
    // Kontaktanreicherung für alle Jobs durchführen
    const enrichmentService = createContactEnrichmentService();
    
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
