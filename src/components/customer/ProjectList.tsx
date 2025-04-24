
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, RefreshCw } from "lucide-react";
import { CustomerProject } from '@/hooks/use-customer-projects';

interface ProjectListProps {
  projects: CustomerProject[];
  isFallbackData: boolean;
  onRetry: () => void;
  isRefetching: boolean;
  onProjectClick: (id: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  isFallbackData,
  onRetry,
  isRefetching,
  onProjectClick
}) => {
  const getStatusInGerman = (status: string): string => {
    const statusMap: Record<string, string> = {
      'planning': 'Planung',
      'in_progress': 'In Bearbeitung',
      'review': 'Überprüfung',
      'completed': 'Abgeschlossen',
      'canceled': 'Abgebrochen',
      'on_hold': 'Pausiert'
    };
    return statusMap[status] || status;
  };

  if (projects.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
        <h3 className="text-lg font-medium mb-2">Keine Projekte gefunden</h3>
        <p className="text-gray-500">Sie haben derzeit keine Projekte.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isFallbackData && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Hinweis</AlertTitle>
          <AlertDescription>
            <p>Es werden zwischengespeicherte Daten angezeigt. Die Verbindung zur Datenbank konnte nicht hergestellt werden.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="mt-2"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
              Aktualisieren
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div 
            key={project.id}
            className="border rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer shadow-sm hover:shadow animate-fade-in"
            onClick={() => onProjectClick(project.id)}
          >
            <div className="flex justify-between">
              <h4 className="font-medium truncate">{project.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                project.status === 'completed' ? 'bg-green-100 text-green-700' :
                project.status === 'canceled' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {getStatusInGerman(project.status)}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {project.description || 'Keine Beschreibung'}
            </p>
            
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Fortschritt</span>
                <span className="text-xs font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
