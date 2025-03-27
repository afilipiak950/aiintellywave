
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "../../../components/ui/card";
import { Folder, Calendar, BarChart3, Settings, MessageSquare, User, FileText, HelpCircle } from 'lucide-react';

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

const TileGrid = () => {
  const navigate = useNavigate();
  
  const handleTileClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiles.map((tile, index) => (
        <DashboardTile 
          key={index}
          title={tile.title}
          description={tile.description}
          icon={tile.icon}
          path={tile.path}
          color={tile.color}
          borderColor={tile.borderColor}
          onClick={handleTileClick}
        />
      ))}
    </div>
  );
};

interface DashboardTileProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  borderColor: string;
  onClick: (path: string) => void;
}

const DashboardTile = ({ 
  title, 
  description, 
  icon, 
  path, 
  color, 
  borderColor,
  onClick 
}: DashboardTileProps) => {
  return (
    <div 
      onClick={() => onClick(path)}
      className={`
        cursor-pointer 
        transition-all 
        duration-300 
        ease-in-out 
        transform 
        hover:-translate-y-2 
        hover:shadow-lg 
        hover:scale-105 
        active:scale-95
      `}
    >
      <Card className={`h-full border-2 ${borderColor} ${color}`}>
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="mb-4 mt-2">{icon}</div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TileGrid;
