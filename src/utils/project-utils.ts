
import { toast } from "../hooks/use-toast";

// Helper to calculate progress based on status
export const getProgressByStatus = (status: string): number => {
  switch (status) {
    case 'planning': return 10;
    case 'in_progress': return 50;
    case 'review': return 80;
    case 'completed': return 100;
    case 'canceled': return 0;
    default: return 0;
  }
};

// Filter and search projects
export const filterAndSearchProjects = (
  projects: any[],
  filter: string,
  searchTerm: string
): any[] => {
  return projects
    .filter(project => 
      filter === 'all' || 
      (filter === 'active' && project.status !== 'completed' && project.status !== 'canceled') ||
      (filter === 'completed' && project.status === 'completed')
    )
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Format projects data from Supabase response
export const formatProjectsData = async (
  projectsData: any[],
  companyId: string | undefined,
  supabase: any
) => {
  if (!projectsData.length) return [];
  
  try {
    // Get company name in a separate query
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .maybeSingle();
      
    const companyName = companyError ? 'Unknown Company' : companyData?.name || 'Unknown Company';
    
    return projectsData.map(project => ({
      id: project.id,
      name: project.name || 'Unnamed Project',
      description: project.description || '',
      status: project.status || 'planning',
      company: companyName,
      start_date: project.start_date,
      end_date: project.end_date,
      progress: getProgressByStatus(project.status),
    }));
  } catch (error) {
    console.error('Error formatting project data:', error);
    // Return basic formatted data even if company name fetch fails
    return projectsData.map(project => ({
      id: project.id,
      name: project.name || 'Unnamed Project',
      description: project.description || '',
      status: project.status || 'planning',
      company: 'Unknown Company',
      start_date: project.start_date,
      end_date: project.end_date,
      progress: getProgressByStatus(project.status),
    }));
  }
};

// Helper to determine if an error is related to RLS policies
export const isRLSError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = typeof error === 'string' ? error : error.message || '';
  return errorMessage.includes('infinite recursion') || 
         errorMessage.includes('policy') ||
         errorMessage.includes('42P17');
};

// Helper to get user-friendly error message
export const getFriendlyErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error';
  
  const errorMessage = typeof error === 'string' ? error : error.message || '';
  
  if (isRLSError(error)) {
    return 'Datenbankberechtigungsfehler: Bitte versuchen Sie es später erneut.';
  }
  
  if (errorMessage.includes('JWT')) {
    return 'Authentifizierungsfehler: Bitte melden Sie sich erneut an.';
  }
  
  if (errorMessage.includes('network')) {
    return 'Netzwerkfehler: Bitte überprüfen Sie Ihre Internetverbindung.';
  }
  
  return errorMessage || 'Unbekannter Fehler beim Laden der Daten.';
};
