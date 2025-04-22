
import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '@/pages/Customer/Dashboard';
import Projects from '@/pages/Customer/Projects';
import ProjectDetail from '@/pages/Customer/ProjectDetail';
import Pipeline from '@/pages/Customer/Pipeline';
import SearchStrings from '@/pages/Customer/SearchStrings';
import Appointments from '@/pages/Customer/Appointments';
import JobParsing from '@/pages/Customer/JobParsing';
import LeadDatabase from '@/pages/Customer/LeadDatabase';
import Integrations from '@/pages/Customer/Integrations';
import KiPersonas from '@/pages/Customer/KiPersonas';
import MiraAI from '@/pages/Customer/MiraAI';
import TrainAI from '@/pages/Customer/TrainAI';
import Outreach from '@/pages/Customer/Outreach';
import FeatureDebug from '@/pages/Customer/FeatureDebug';
import CustomerWorkflows from '@/pages/Customer/CustomerWorkflows';
import Profile from '@/pages/Customer/Profile';
import Settings from '@/pages/Customer/Settings';

const CustomerRoutes = () => (
  <>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="projects" element={<Projects />} />
    <Route path="projects/:id" element={<ProjectDetail />} />
    <Route path="pipeline" element={<Pipeline />} />
    <Route path="search-strings" element={<SearchStrings />} />
    <Route path="appointments" element={<Appointments />} />
    <Route path="job-parsing" element={<JobParsing />} />
    <Route path="lead-database" element={<LeadDatabase />} />
    <Route path="integrations" element={<Integrations />} />
    <Route path="ki-personas" element={<KiPersonas />} />
    <Route path="mira-ai" element={<MiraAI />} />
    <Route path="train-ai" element={<TrainAI />} />
    <Route path="outreach" element={<Outreach />} />
    <Route path="feature-debug" element={<FeatureDebug />} />
    <Route path="workflows" element={<CustomerWorkflows />} />
    <Route path="profile" element={<Profile />} />
    <Route path="settings/*" element={<Settings />} />
    <Route index element={<Dashboard />} />
  </>
);

export default CustomerRoutes;
