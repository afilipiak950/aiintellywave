
// Diese Datei enthält den synchronen Verarbeitungscode
import { supabaseFunctionClient } from "./config.ts";
import { apolloApiKey } from "./config.ts";

export async function processRequestSync({ url, maxPages, maxDepth, documents }: {
  url: string;
  maxPages: number;
  maxDepth: number;
  documents: any[];
}) {
  try {
    console.log("Starte synchrone Verarbeitung mit folgenden Parametern:", {
      url,
      maxPages,
      maxDepth,
      documentCount: documents?.length || 0
    });
    
    // Verbindung zur Datenbank herstellen
    const supabase = await supabaseFunctionClient();
    
    // 1. Bestehende Job-Angebote abrufen, um Duplikate zu vermeiden
    const { data: existingJobs, error: jobsError } = await supabase
      .from('job_offers')
      .select('id, company_name, title')
      .limit(50);
      
    if (jobsError) {
      console.error("Fehler beim Abrufen bestehender Jobs:", jobsError);
    }
    
    console.log(`${existingJobs?.length || 0} bestehende Jobs gefunden`);
    
    // 2. Beispiel-Job-Angebote erstellen (für Demo-Zwecke)
    // In einer echten Implementierung würden hier Daten von einem Web Scraper oder API kommen
    const sampleJobs = [
      { title: "Senior Projektmanager", company: "TechStart GmbH", location: "Berlin" },
      { title: "Projektleiter Digitalisierung", company: "Digital Solutions AG", location: "Berlin" },
      { title: "IT-Projektmanager", company: "InnovateIT", location: "Berlin" },
      { title: "Projektmanager Softwareentwicklung", company: "CodeMasters", location: "Berlin" },
      { title: "Agile Projektmanager", company: "Scrum Solutions", location: "Berlin" }
    ];
    
    // 3. Jobs in die Datenbank einfügen
    let jobsProcessed = 0;
    let contactsCreated = 0;
    
    for (const job of sampleJobs) {
      // Prüfen, ob der Job bereits existiert
      const isDuplicate = existingJobs?.some(existingJob => 
        existingJob.title.toLowerCase().includes(job.title.toLowerCase()) && 
        existingJob.company_name.toLowerCase().includes(job.company.toLowerCase())
      );
      
      if (!isDuplicate) {
        // Job in die Datenbank einfügen
        const { data: newJob, error: insertJobError } = await supabase
          .from('job_offers')
          .insert({
            title: job.title,
            company_name: job.company,
            location: job.location,
            description: `Stellenbeschreibung für ${job.title} bei ${job.company}`,
            url: `https://example.com/jobs/${job.title.toLowerCase().replace(/\s+/g, '-')}`,
            source: 'demo_data'
          })
          .select()
          .single();
          
        if (insertJobError) {
          console.error(`Fehler beim Einfügen des Jobs ${job.title}:`, insertJobError);
          continue;
        }
        
        if (newJob) {
          jobsProcessed++;
          console.log(`Job erstellt: ${job.title} bei ${job.company} mit ID ${newJob.id}`);
          
          // 4. HR-Kontakte für den Job erstellen
          const contactData = [
            {
              full_name: `HR Manager ${job.company}`,
              role: "HR Manager",
              email: `hr@${job.company.toLowerCase().replace(/\s+/g, '')}.example.com`,
              phone: "+49123456789",
              seniority: "Senior",
              department: "Human Resources",
              job_offer_id: newJob.id,
              source: "demo_data"
            },
            {
              full_name: `Recruiter ${job.company}`,
              role: "Recruiter",
              email: `recruiter@${job.company.toLowerCase().replace(/\s+/g, '')}.example.com`,
              phone: "+49987654321",
              seniority: "Junior",
              department: "Talent Acquisition",
              job_offer_id: newJob.id,
              source: "demo_data"
            }
          ];
          
          for (const contact of contactData) {
            const { data: newContact, error: insertContactError } = await supabase
              .from('hr_contacts')
              .insert(contact);
              
            if (insertContactError) {
              console.error(`Fehler beim Einfügen des Kontakts ${contact.full_name}:`, insertContactError);
            } else {
              contactsCreated++;
              console.log(`Kontakt erstellt: ${contact.full_name} für Job ${newJob.id}`);
            }
          }
        }
      } else {
        console.log(`Job übersprungen (Duplikat): ${job.title} bei ${job.company}`);
      }
    }
    
    console.log("Synchrone Verarbeitung erfolgreich abgeschlossen");
    
    return {
      success: true,
      message: "Synchronisierung erfolgreich",
      jobsProcessed: jobsProcessed,
      contactsFound: contactsCreated,
      url,
      processedDocuments: documents?.length || 0
    };
  } catch (error) {
    console.error("Fehler bei der synchronen Verarbeitung:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler bei der Verarbeitung",
      url
    };
  }
}
