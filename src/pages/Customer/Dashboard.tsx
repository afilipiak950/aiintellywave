
import { useNavigate } from 'react-router-dom';
import { Folder, Calendar, BarChart3, Settings, MessageSquare, User, FileText, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/auth';
import { Card, CardContent } from "../../components/ui/card";
import { motion } from 'framer-motion';

// Framer motion ist nicht installiert, aber wir verwenden einfache CSS Animationen stattdessen
// Wir definieren unsere Kacheln
const tiles = [
  {
    title: "Projekte",
    description: "Alle Ihre laufenden und abgeschlossenen Projekte",
    icon: <Folder className="h-12 w-12 text-indigo-500" />,
    path: "/customer/projects",
    color: "bg-indigo-50 hover:bg-indigo-100",
    borderColor: "border-indigo-200"
  },
  {
    title: "Statistiken",
    description: "Leistungskennzahlen und Projektfortschritt",
    icon: <BarChart3 className="h-12 w-12 text-green-500" />,
    path: "/customer/statistics",
    color: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200"
  },
  {
    title: "Termine",
    description: "Anstehende Besprechungen und Ereignisse",
    icon: <Calendar className="h-12 w-12 text-blue-500" />,
    path: "/customer/calendar",
    color: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200"
  },
  {
    title: "Mitteilungen",
    description: "Ungelesene Nachrichten und Updates",
    icon: <MessageSquare className="h-12 w-12 text-amber-500" />,
    path: "/customer/messages",
    color: "bg-amber-50 hover:bg-amber-100",
    borderColor: "border-amber-200"
  },
  {
    title: "MIRA KI",
    description: "KI-Assistent für intelligente Unterstützung",
    icon: <HelpCircle className="h-12 w-12 text-purple-500" />,
    path: "/customer/mira-ai",
    color: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200"
  },
  {
    title: "Dokumente",
    description: "Wichtige Projektdokumente und Dateien",
    icon: <FileText className="h-12 w-12 text-rose-500" />,
    path: "/customer/documents",
    color: "bg-rose-50 hover:bg-rose-100",
    borderColor: "border-rose-200"
  },
  {
    title: "Profil",
    description: "Ihre persönlichen Einstellungen und Profil",
    icon: <User className="h-12 w-12 text-sky-500" />,
    path: "/customer/profile",
    color: "bg-sky-50 hover:bg-sky-100",
    borderColor: "border-sky-200"
  },
  {
    title: "Einstellungen",
    description: "Anpassung Ihres Kundenportals",
    icon: <Settings className="h-12 w-12 text-gray-500" />,
    path: "/customer/settings",
    color: "bg-gray-50 hover:bg-gray-100",
    borderColor: "border-gray-200"
  },
];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleTileClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Willkommen zurück, {user?.firstName || 'Kunde'}</h1>
        <p className="text-gray-600 mt-1">Hier ist eine Übersicht Ihres Kundenportals.</p>
      </div>
      
      {/* Kachel-basiertes Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiles.map((tile, index) => (
          <div 
            key={index}
            onClick={() => handleTileClick(tile.path)}
            className={`cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg`}
          >
            <Card className={`h-full border-2 ${tile.borderColor} ${tile.color}`}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="mb-4 mt-2">{tile.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{tile.title}</h3>
                <p className="text-sm text-gray-600">{tile.description}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Projektübersicht */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Ihre Projekte</h2>
        <CustomerProjectsList />
      </div>
    </div>
  );
};

// Komponente für die Projektliste
const CustomerProjectsList = () => {
  const navigate = useNavigate();
  
  // Wir verwenden useCustomerProjects hook für echte Daten
  const { projects, loading } = useCustomerProjects();
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Sie haben derzeit keine aktiven Projekte.</p>
        <button 
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          onClick={() => navigate('/customer/projects')}
        >
          Zur Projektübersicht
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div 
          key={project.id} 
          className="border rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer"
          onClick={() => navigate(`/customer/projects/${project.id}`)}
        >
          <div className="flex justify-between">
            <h4 className="font-medium">{project.name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              project.status === 'completed' ? 'bg-green-100 text-green-700' :
              project.status === 'canceled' ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {getStatusInGerman(project.status)}
            </span>
          </div>
          
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
      
      <div className="text-center pt-2">
        <button 
          className="px-4 py-2 text-indigo-600 hover:text-indigo-800 transition-colors"
          onClick={() => navigate('/customer/projects')}
        >
          Alle Projekte anzeigen →
        </button>
      </div>
    </div>
  );
};

// Hook-Import und Status-Übersetzungen
import { useCustomerProjects } from '../../hooks/use-customer-projects';

// Hilfsfunktion um Projektstatus ins Deutsche zu übersetzen
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

export default CustomerDashboard;
