
import { BriefcaseIcon, UserIcon, SearchIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { AgentData } from './dashboard/AgentCard';
import DashboardHeader from './dashboard/DashboardHeader';
import AgentsList from './dashboard/AgentsList';

const AIAgentsDashboard = () => {
  // KI-Agenten Daten
  const agents: AgentData[] = [
    {
      id: "sales",
      title: "Vertriebsagent",
      icon: <BriefcaseIcon className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      description: "Steigern Sie Verkäufe und Lead-Generierung mit KI-Unterstützung",
      features: [
        "Personalisierte Outreach-E-Mails generieren",
        "Leads automatisch qualifizieren",
        "Follow-up-Erinnerungen planen",
        "Verkaufsgespräche analysieren"
      ]
    },
    {
      id: "recruiting",
      title: "Recruiting-Agent",
      icon: <UserIcon className="h-6 w-6" />,
      color: "from-indigo-500 to-indigo-600",
      description: "Finden und engagieren Sie effizient Spitzentalente",
      features: [
        "Suche nach Kandidaten nach Fähigkeiten",
        "LinkedIn-Profile analysieren",
        "Interviewfragen generieren",
        "Kandidatenfortschritt verfolgen"
      ]
    },
    {
      id: "research",
      title: "Recherche-Agent",
      icon: <SearchIcon className="h-6 w-6" />,
      color: "from-sky-500 to-sky-600",
      description: "Tiefgehende Recherche und Wettbewerbsanalyse",
      features: [
        "Markttrends analysieren",
        "Wettbewerberaktivitäten verfolgen",
        "Branchenberichte generieren",
        "Strategische Chancen finden"
      ]
    }
  ];

  return (
    <div className="w-full rounded-xl shadow-xl overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="relative z-10">
        <DashboardHeader />
        <AgentsList agents={agents} />
      </div>
    </div>
  );
};

export default AIAgentsDashboard;
