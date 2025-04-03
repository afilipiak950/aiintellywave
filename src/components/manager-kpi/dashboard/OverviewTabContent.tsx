
import React from 'react';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';

const OverviewTabContent = ({ kpis, kpisLoading }: { kpis: any[], kpisLoading: boolean }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Team Overview</h3>
        <div className="space-y-4">
          {kpisLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ) : kpis.length === 0 ? (
            <p className="text-muted-foreground">No team members data available.</p>
          ) : (
            <div className="divide-y">
              {kpis.map((user) => (
                <div key={user.user_id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.full_name || user.email}</p>
                    <p className="text-sm text-gray-500">{user.role || 'Team Member'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{user.projects_count || 0} Projects</p>
                    <p className="text-sm text-gray-500">
                      {user.leads_count || 0} Leads / {user.appointments_count || 0} Appointments
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Project Status Distribution</h3>
        {kpisLoading ? (
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{kpis.reduce((sum, user) => sum + Number(user.projects_planning || 0), 0)}</p>
                <p className="text-sm text-blue-600">Planning</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-amber-700">{kpis.reduce((sum, user) => sum + Number(user.projects_active || 0), 0)}</p>
                <p className="text-sm text-amber-600">Active</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{kpis.reduce((sum, user) => sum + Number(user.projects_completed || 0), 0)}</p>
                <p className="text-sm text-green-600">Completed</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTabContent;
