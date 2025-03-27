
import { useState } from 'react';
import { useAuth } from '../../context/auth';
import LineChart from '../../components/ui/dashboard/LineChart';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const StatisticsPage = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('6months');
  
  // Beispieldaten für Charts
  const campaignData = [
    { name: 'Jan', views: 4000, clicks: 2400, conversions: 800 },
    { name: 'Feb', views: 3000, clicks: 1600, conversions: 600 },
    { name: 'Mär', views: 5000, clicks: 2700, conversions: 900 },
    { name: 'Apr', views: 7000, clicks: 4000, conversions: 1200 },
    { name: 'Mai', views: 6000, clicks: 3200, conversions: 1100 },
    { name: 'Jun', views: 8000, clicks: 4800, conversions: 1600 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Statistiken</h1>
          <p className="text-gray-600 mt-1">Leistungsübersicht Ihrer Projekte und Kampagnen</p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zeitraum auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Letzte 30 Tage</SelectItem>
            <SelectItem value="3months">Letzte 3 Monate</SelectItem>
            <SelectItem value="6months">Letzte 6 Monate</SelectItem>
            <SelectItem value="1year">Letztes Jahr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="campaigns">Kampagnen</TabsTrigger>
          <TabsTrigger value="projects">Projekte</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Aktive Projekte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3</div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <span>↑ 12%</span>
                  <span className="ml-1 text-gray-500">vs. letztem Quartal</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Abgeschlossene Projekte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">7</div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <span>↑ 23%</span>
                  <span className="ml-1 text-gray-500">vs. letztem Quartal</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Durchschn. Projektdauer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">65 Tage</div>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <span>↑ 5%</span>
                  <span className="ml-1 text-gray-500">vs. letztem Quartal</span>
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <LineChart
              data={campaignData}
              dataKeys={['views', 'clicks', 'conversions']}
              title="Kampagnenleistung"
              subtitle="Leistungskennzahlen für Ihre aktiven Kampagnen"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center py-12">
            <h3 className="text-lg font-medium mb-2">Detaillierte Kampagnenstatistiken</h3>
            <p className="text-gray-500">Diese Funktion wird bald verfügbar sein.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center py-12">
            <h3 className="text-lg font-medium mb-2">Detaillierte Projektstatistiken</h3>
            <p className="text-gray-500">Diese Funktion wird bald verfügbar sein.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticsPage;
