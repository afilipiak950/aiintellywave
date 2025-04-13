
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '@/pages/Customer/Dashboard';
import Projects from '@/pages/Customer/Projects';
import ProjectDetail from '@/pages/Customer/ProjectDetail';
import Profile from '@/pages/Customer/Profile';
import Settings from '@/pages/Customer/Settings';
import SearchStrings from '@/pages/Customer/SearchStrings';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings/*" element={<Settings />} />
      <Route path="/search-strings" element={<SearchStrings />} />
      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  );
};

export default CustomerRoutes;
