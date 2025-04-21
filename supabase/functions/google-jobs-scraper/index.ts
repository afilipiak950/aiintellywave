
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS request for CORS
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    console.log("Request data:", JSON.stringify(requestData));

    const {
      searchParams,
      userId,
      companyId,
      forceNewSearch = false,
      enhanceLinks = true
    } = requestData;

    // Validate search parameters
    if (!searchParams || !searchParams.query) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Ein Suchbegriff ist erforderlich"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Suche nach: "${searchParams.query}" in ${searchParams.location || 'allen Standorten'}`);

    try {
      // Mock Google Jobs Ergebnisse (Beispieldaten für Demozwecke)
      const mockResults = generateMockJobResults(
        searchParams.query,
        searchParams.location,
        searchParams.industry,
        searchParams.experience
      );

      // Falls keine Ergebnisse, eine informative Meldung zurückgeben
      if (mockResults.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: `Keine Jobangebote für "${searchParams.query}" gefunden. Versuchen Sie andere Suchbegriffe.`,
            data: { results: [] }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`${mockResults.length} Jobangebote gefunden`);

      // Bei erfolgreichem Abruf die Ergebnisse zurückgeben
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            results: mockResults,
            query: searchParams.query,
            location: searchParams.location || null,
            totalResults: mockResults.length
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error(`Fehler bei Google Jobs Suche: ${err.message}`);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: "Fehler bei der Jobsuche. Bitte versuchen Sie es später erneut."
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Google Jobs Scraper Fehler:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Server-Fehler: ${error.message}`
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Function to generate mock job results
function generateMockJobResults(query: string, location?: string, industry?: string, experience?: string) {
  const jobTitles = [
    "Software Engineer", "Product Manager", "Data Scientist", "UX Designer",
    "Marketing Manager", "Sales Representative", "HR Specialist", "Account Manager",
    "Project Manager", "Business Analyst", "Frontend Developer", "Backend Developer",
    "Full Stack Developer", "DevOps Engineer", "Content Writer", "Graphic Designer"
  ];

  const companies = [
    "Google", "Microsoft", "Amazon", "Apple", "Facebook", "Netflix", "Airbnb",
    "Uber", "Spotify", "Twitter", "LinkedIn", "IBM", "Intel", "Oracle", "SAP",
    "Siemens", "Bosch", "Deutsche Bank", "Allianz", "BMW", "Mercedes-Benz", "Volkswagen"
  ];

  const locations = location ? 
    [location, `Remote - ${location}`, `Hybrid - ${location}`] : 
    ["Berlin", "München", "Hamburg", "Frankfurt", "Köln", "Stuttgart", "Düsseldorf", "Remote - Deutschland"];

  // Filter job titles based on search query
  const filteredTitles = jobTitles.filter(title => 
    title.toLowerCase().includes(query.toLowerCase()) ||
    Math.random() > 0.5 // Include some random matches
  );

  // If no matches, use all titles
  const titlesToUse = filteredTitles.length > 0 ? filteredTitles : jobTitles;

  // Generate 15-25 mock results
  const resultCount = Math.floor(Math.random() * 10) + 15;
  const results = [];

  for (let i = 0; i < resultCount; i++) {
    const title = titlesToUse[Math.floor(Math.random() * titlesToUse.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const jobLocation = locations[Math.floor(Math.random() * locations.length)];
    
    // Generate a random date within the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const postedDate = new Date();
    postedDate.setDate(postedDate.getDate() - daysAgo);
    
    // Generate a random salary
    const minSalary = 40000 + Math.floor(Math.random() * 60000);
    const maxSalary = minSalary + 10000 + Math.floor(Math.random() * 40000);
    
    // Employment types
    const employmentTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY", "INTERN"];
    const employmentType = employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
    
    // Generate mock job
    results.push({
      title: `${title}${query ? ` - ${query}` : ""}`,
      company: company,
      location: jobLocation,
      description: generateMockJobDescription(title, company),
      url: `https://example.com/jobs/${company.toLowerCase().replace(/\s+/g, '-')}/${title.toLowerCase().replace(/\s+/g, '-')}`,
      directApplyLink: Math.random() > 0.5 ? `https://apply.example.com/jobs/${Math.floor(Math.random() * 10000)}` : null,
      datePosted: postedDate.toISOString(),
      salary: `${formatSalary(minSalary)} - ${formatSalary(maxSalary)} EUR`,
      employmentType: employmentType,
      source: "Google Jobs"
    });
  }

  return results;
}

// Helper function to format salary
function formatSalary(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Function to generate a mock job description
function generateMockJobDescription(title: string, company: string): string {
  const responsibilities = [
    "Entwicklung und Wartung von Software",
    "Zusammenarbeit mit verschiedenen Teams",
    "Identifizierung und Behebung von Problemen",
    "Erstellung technischer Dokumentation",
    "Teilnahme an Code-Reviews",
    "Implementierung neuer Features",
    "Optimierung der Performance",
    "Sicherstellung der Codequalität",
    "Bearbeitung von Bug-Reports",
    "Unterstützung bei der Produktentwicklung"
  ];

  const requirements = [
    "Bachelor-Abschluss in Informatik oder verwandtem Bereich",
    "Mindestens 3 Jahre Berufserfahrung",
    "Fundierte Kenntnisse in der Programmierung",
    "Erfahrung mit agilen Entwicklungsmethoden",
    "Teamfähigkeit und gute Kommunikationsfähigkeiten",
    "Problemlösungsfähigkeiten",
    "Selbstständige Arbeitsweise",
    "Bereitschaft zur Weiterbildung",
    "Englischkenntnisse in Wort und Schrift",
    "Erfahrung mit relevanten Technologien"
  ];

  const benefits = [
    "Flexible Arbeitszeiten",
    "Remote-Arbeit möglich",
    "Wettbewerbsfähiges Gehalt",
    "Betriebliche Altersvorsorge",
    "Kostenlose Getränke und Snacks",
    "Regelmäßige Teamevents",
    "Fortbildungsmöglichkeiten",
    "Modernes Arbeitsumfeld",
    "Familiäre Unternehmenskultur",
    "30 Tage Urlaub"
  ];

  // Select 5 random responsibilities, requirements, and benefits
  const selectedResponsibilities = shuffleAndTake(responsibilities, 5);
  const selectedRequirements = shuffleAndTake(requirements, 5);
  const selectedBenefits = shuffleAndTake(benefits, 5);

  // Build the description
  return `
${company} sucht eine:n engagierte:n ${title} zur Verstärkung unseres Teams.

Aufgaben:
${selectedResponsibilities.map(r => `- ${r}`).join('\n')}

Anforderungen:
${selectedRequirements.map(r => `- ${r}`).join('\n')}

Wir bieten:
${selectedBenefits.map(b => `- ${b}`).join('\n')}

Bei Interesse bewerben Sie sich jetzt bei ${company} und werden Teil unseres Teams!
  `;
}

// Helper function to shuffle an array and take n elements
function shuffleAndTake<T>(array: T[], n: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}
