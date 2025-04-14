
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job-parsing';

export const useJobSearchApi = (companyId: string | null, userId: string | null) => {
  // Function to get the user's company ID (if not provided)
  const getUserCompanyId = async (userId: string): Promise<string | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching company ID:', error);
        return null;
      }
      
      return data?.company_id || null;
    } catch (err) {
      console.error('Exception fetching company ID:', err);
      return null;
    }
  };

  // Function to search for jobs based on search parameters
  const searchJobs = async (searchParams: {
    query: string;
    location: string;
    experience: string;
    industry: string;
  }): Promise<Job[]> => {
    try {
      if (!userId || !companyId) {
        console.error('Missing user ID or company ID for job search');
        return [];
      }
      
      console.log('Searching jobs with params:', searchParams);
      
      // In a real app, this would call an API to search for jobs
      // For this demo, we'll use mock data
      const mockJobs: Job[] = generateMockJobs(searchParams.query, searchParams.location);
      
      // Save search to history
      await saveSearchHistory(searchParams, mockJobs);
      
      return mockJobs;
    } catch (error) {
      console.error('Error searching jobs:', error);
      return [];
    }
  };

  // Function to generate AI contact suggestion based on job results
  const generateAiContactSuggestion = async (jobs: Job[], query: string): Promise<any> => {
    try {
      if (!userId || !companyId || jobs.length === 0) {
        console.error('Missing data for AI suggestion');
        return null;
      }
      
      console.log('Generating AI contact suggestion for jobs:', jobs.length);
      
      // In a real app, this would call an AI API
      // For this demo, we'll use mock data
      const mockSuggestion = {
        subject: `Regarding ${query} opportunity`,
        greeting: "Dear Hiring Manager,",
        body: `I noticed your company is looking for candidates with expertise in ${query}. I believe my skills and experience make me a strong fit for this role.`,
        closing: "I look forward to discussing this opportunity further.\n\nBest regards,\n[Your Name]",
        tips: [
          "Mention specific achievements related to the job requirements",
          "Reference something specific about the company to show your interest",
          "Keep your email concise and professional"
        ]
      };
      
      // Update the latest search with the AI suggestion
      await updateLatestSearchWithAiSuggestion(mockSuggestion);
      
      return mockSuggestion;
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      return null;
    }
  };

  // Function to load search history
  const loadSearchHistory = async (userId: string): Promise<any[]> => {
    try {
      if (!companyId) {
        console.log('No company ID available for loading search history');
        return [];
      }
      
      console.log('Loading job search history for user:', userId);
      
      const { data, error } = await supabase
        .from('job_search_history')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error loading search history:', error);
        return [];
      }
      
      // Convert search_results from JSON to Job objects
      return data.map(record => ({
        ...record,
        search_results: record.search_results || [],
        ai_contact_suggestion: record.ai_contact_suggestion || null
      }));
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  };

  // Helper function to save search to history
  const saveSearchHistory = async (
    searchParams: {
      query: string;
      location: string;
      experience: string;
      industry: string;
    },
    jobs: Job[]
  ): Promise<void> => {
    try {
      if (!userId || !companyId) return;
      
      console.log('Saving search to history:', searchParams.query);
      
      // Convert the jobs array to a format that can be stored in Supabase
      const jobsJson = jobs as any; // Cast to any for insertion
      
      await supabase
        .from('job_search_history')
        .insert({
          user_id: userId,
          company_id: companyId,
          search_query: searchParams.query,
          search_location: searchParams.location || null,
          search_experience: searchParams.experience || null,
          search_industry: searchParams.industry || null,
          search_results: jobsJson,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Helper function to update the latest search with AI suggestion
  const updateLatestSearchWithAiSuggestion = async (suggestion: any): Promise<void> => {
    try {
      if (!userId || !companyId) return;
      
      // Get the latest search record
      const { data, error } = await supabase
        .from('job_search_history')
        .select('id')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error || !data || data.length === 0) {
        console.error('Error fetching latest search:', error);
        return;
      }
      
      // Update with AI suggestion
      await supabase
        .from('job_search_history')
        .update({
          ai_contact_suggestion: suggestion,
          updated_at: new Date().toISOString()
        })
        .eq('id', data[0].id);
    } catch (error) {
      console.error('Error updating search with AI suggestion:', error);
    }
  };

  // Helper function to generate mock job data
  const generateMockJobs = (query: string, location: string): Job[] => {
    const count = Math.floor(Math.random() * 10) + 5; // 5-15 jobs
    const jobs: Job[] = [];
    
    for (let i = 0; i < count; i++) {
      jobs.push({
        title: `${query} ${generateJobTitle()}`,
        company: generateCompanyName(),
        location: location || generateLocation(),
        description: generateJobDescription(query),
        url: `https://example.com/jobs/${i}`,
        datePosted: generateRandomDate()
      });
    }
    
    return jobs;
  };

  // Helper function to generate random job titles
  const generateJobTitle = (): string => {
    const titles = [
      'Engineer', 'Developer', 'Specialist', 'Manager', 'Director',
      'Coordinator', 'Analyst', 'Expert', 'Lead', 'Consultant'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  // Helper function to generate random company names
  const generateCompanyName = (): string => {
    const prefixes = ['Tech', 'Global', 'Smart', 'Next', 'Future', 'Digital', 'Innovative'];
    const suffixes = ['Systems', 'Solutions', 'Technologies', 'Enterprises', 'Inc', 'Group', 'Labs'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${
      suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  };

  // Helper function to generate random locations
  const generateLocation = (): string => {
    const cities = ['Berlin', 'Hamburg', 'Munich', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf'];
    return cities[Math.floor(Math.random() * cities.length)];
  };

  // Helper function to generate random job descriptions
  const generateJobDescription = (query: string): string => {
    return `We are looking for an experienced ${query} ${generateJobTitle()} to join our team. 
    The ideal candidate will have strong skills in ${query} and related technologies. 
    You will be responsible for designing, developing and implementing solutions 
    for our clients. Required skills include problem-solving abilities, 
    teamwork, and excellent communication.`;
  };

  // Helper function to generate random dates within the last month
  const generateRandomDate = (): string => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    return pastDate.toISOString().split('T')[0];
  };

  return {
    getUserCompanyId,
    searchJobs,
    generateAiContactSuggestion,
    loadSearchHistory
  };
};
