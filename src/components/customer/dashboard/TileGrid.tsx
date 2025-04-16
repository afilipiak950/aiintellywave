
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "../../../components/ui/card";
import { Folder, Calendar, BarChart3, Settings, User, FileText, HelpCircle, MessageSquare, UserCircle, Users, Search } from 'lucide-react';
import { Badge } from "../../../components/ui/badge";
import { motion } from 'framer-motion';

const tiles = [
  {
    title: "Projekte",
    description: "Alle Ihre laufenden und abgeschlossenen Projekte",
    icon: <Folder className="h-12 w-12 text-indigo-500" />,
    path: "/customer/projects",
    color: "bg-gradient-to-br from-indigo-50 to-blue-100 hover:from-indigo-100 hover:to-blue-200",
    borderColor: "border-indigo-200"
  },
  {
    title: "Statistiken",
    description: "Leistungskennzahlen und Projektfortschritt",
    icon: <BarChart3 className="h-12 w-12 text-green-500" />,
    path: "/customer/statistics",
    color: "bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200",
    borderColor: "border-green-200",
    comingSoon: true
  },
  {
    title: "Termine",
    description: "Anstehende Besprechungen und Ereignisse",
    icon: <Calendar className="h-12 w-12 text-blue-500" />,
    path: "/customer/appointments",
    color: "bg-gradient-to-br from-blue-50 to-sky-100 hover:from-blue-100 hover:to-sky-200",
    borderColor: "border-blue-200"
  },
  {
    title: "Suchbegriffe",
    description: "Verwalten und erstellen Sie Suchbegriffe",
    icon: <Search className="h-12 w-12 text-purple-500" />,
    path: "/customer/search-strings",
    color: "bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200",
    borderColor: "border-purple-200"
  },
  {
    title: "Lead Database",
    description: "Verwalten Sie Ihre Leads und Kandidaten",
    icon: <Users className="h-12 w-12 text-rose-500" />,
    path: "/customer/leads",
    color: "bg-gradient-to-br from-rose-50 to-pink-100 hover:from-rose-100 hover:to-pink-200",
    borderColor: "border-rose-200"
  },
  {
    title: "Profil",
    description: "Ihre persönlichen Einstellungen und Profil",
    icon: <User className="h-12 w-12 text-sky-500" />,
    path: "/customer/profile",
    color: "bg-gradient-to-br from-sky-50 to-cyan-100 hover:from-sky-100 hover:to-cyan-200",
    borderColor: "border-sky-200"
  },
  {
    title: "KI-Personas",
    description: "Erstellen und verwalten Sie Ihre KI-Assistenten",
    icon: <UserCircle className="h-12 w-12 text-amber-500" />,
    path: "/customer/ki-personas",
    color: "bg-gradient-to-br from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200",
    borderColor: "border-amber-200"
  },
  {
    title: "Outreach",
    description: "Automatisiertes Lead-Management und Outreach",
    icon: <MessageSquare className="h-12 w-12 text-teal-500" />,
    path: "/customer/outreach",
    color: "bg-gradient-to-br from-teal-50 to-emerald-100 hover:from-teal-100 hover:to-emerald-200",
    borderColor: "border-teal-200",
    comingSoon: true
  },
];

const TileGrid = () => {
  const navigate = useNavigate();
  
  const handleTileClick = (path: string) => {
    navigate(path);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
      }
    }
  };
  
  const tileVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: {
      scale: 0.98,
      opacity: 0.9,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {tiles.map((tile, index) => (
        <DashboardTile 
          key={index}
          title={tile.title}
          description={tile.description}
          icon={tile.icon}
          path={tile.path}
          color={tile.color}
          borderColor={tile.borderColor}
          comingSoon={tile.comingSoon}
          onClick={handleTileClick}
          variants={tileVariants}
        />
      ))}
    </motion.div>
  );
};

interface DashboardTileProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  borderColor: string;
  comingSoon?: boolean;
  onClick: (path: string) => void;
  variants?: any;
}

const DashboardTile = ({ 
  title, 
  description, 
  icon, 
  path, 
  color, 
  borderColor,
  comingSoon,
  onClick,
  variants
}: DashboardTileProps) => {
  return (
    <motion.div 
      onClick={() => onClick(path)}
      variants={variants}
      whileHover="hover"
      whileTap="tap"
      className="h-full"
    >
      <Card className={`h-full border-2 relative overflow-hidden ${borderColor} ${color}`}>
        {/* Abstract background shapes */}
        <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full transform -translate-x-12 translate-y-12"></div>
        </div>
        
        {comingSoon && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white border-none">
            Coming Soon
          </Badge>
        )}
        <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
          <motion.div 
            className="mb-4 mt-2"
            whileHover={{ rotate: [0, 10, -10, 10, 0], transition: { duration: 0.5 } }}
          >
            {icon}
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TileGrid;
