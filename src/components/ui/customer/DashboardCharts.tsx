
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Calendar, Users } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

const CustomerDashboardCharts = () => {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Status Overview */}
      <Card className="shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-lg">{t('projects')}</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">{t('comingSoon')}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Upcoming Appointments */}
      <Card className="shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-purple-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-medium text-lg">{t('appointments')}</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">{t('comingSoon')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboardCharts;
