
export const APP_LANGUAGE_KEY = 'APP_LANGUAGE';

export type Language = 'en' | 'de' | 'fr' | 'es';

export type TranslationDict = {
  welcome: string;
  overview: string;
  settings: string;
  language: string;
  theme: string;
  notifications: string;
  security: string;
  profile: string;
  team: string;
  appearance: string;
  comingSoon: string;
  outreachFeature: string;
  description: string;
  stayUpdated: string;
  emailPlaceholder: string;
  notifyMe: string;
  thankYou: string;
  alreadyRegistered: string;
  enterEmail: string;
  dashboard: string;
  projects: string;
  appointments: string;
  messages: string;
  miraAI: string;
  outreach: string;
  logout: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  save: string;
  twoFactorAuth: string;
  enableTwoFactor: string;
  disableTwoFactor: string;
  sessions: string;
  manageSessions: string;
  scheduleConsultation: string;
  appointmentDescription: string;
  selectDateTime: string;
  platformQuestions: string;
  platformQuestionsDesc: string;
  featureDiscussion: string;
  featureDiscussionDesc: string;
  flexibleScheduling: string;
  flexibleSchedulingDesc: string;
  dataInsights: string;
  dataInsightsDesc: string;
  
  // Adding uppercase keys to match SidebarNavItems
  DASHBOARD: string;
  CUSTOMERS: string;
  PROJECTS: string;
  PIPELINE: string;
  LEADS: string;
  SETTINGS: string;
  APPOINTMENTS: string;
  STATISTICS: string;
};
