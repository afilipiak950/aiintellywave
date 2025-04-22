
import { createApolloService } from "./apollo-service.ts";

export const createContactEnrichmentService = () => {
  const apolloService = createApolloService();
  
  return {
    async enrichJobWithContacts(job: { 
      company: string; 
      title: string;
      url: string;
    }) {
      console.log(`Starting enrichment for job: ${job.title} at ${job.company}`);
      
      try {
        // Apollo.io enrichment
        console.log(`Attempting to enrich using Apollo.io for ${job.company}`);
        const apolloResults = await apolloService.enrichJobWithHRContacts(job);
        
        console.log(`Apollo.io enrichment returned ${apolloResults.hrContacts.length} contacts`);
        
        return {
          ...job,
          hrContacts: apolloResults.hrContacts
        };
      } catch (error) {
        console.error('Error in contact enrichment:', error);
        return {
          ...job,
          hrContacts: [],
          error: error instanceof Error ? error.message : 'Unknown error in enrichment'
        };
      }
    },
    
    async enrichJobsWithContacts(jobs: Array<{ 
      company: string; 
      title: string;
      url: string;
    }>) {
      console.log(`Starting batch enrichment for ${jobs.length} jobs`);
      
      const results = await Promise.all(
        jobs.map(job => this.enrichJobWithContacts(job))
      );
      
      console.log(`Completed batch enrichment, results: ${results.length} jobs processed`);
      
      return results;
    }
  };
};
