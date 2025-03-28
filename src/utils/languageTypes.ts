
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
  passwordsMustMatch: string;
  passwordTooShort: string;
  incorrectCurrentPassword: string;
  passwordUpdated: string;
  passwordUpdatedSuccessfully: string;
  passwordUpdateFailed: string;
  save: string;
  updating: string;
  error: string;
  twoFactorAuth: string;
  enableTwoFactor: string;
  disableTwoFactor: string;
  twoFactorDescription: string;
  scanQRCodeOrEnterManually: string;
  enterVerificationCode: string;
  verify: string;
  twoFactorEnabled: string;
  twoFactorEnabledDescription: string;
  twoFactorDisabled: string;
  twoFactorDisabledDescription: string;
  twoFactorSetupFailed: string;
  twoFactorDisableFailed: string;
  invalidVerificationCode: string;
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
  
  selectYourPreferredLanguage: string;
  
  // Uppercase keys for SidebarNavItems
  DASHBOARD: string;
  CUSTOMERS: string;
  PROJECTS: string;
  PIPELINE: string;
  LEADS: string;
  SETTINGS: string;
  APPOINTMENTS: string;
  STATISTICS: string;
  
  // Add the missing translation keys for logout messages
  loggedOut: string;
  loggedOutSuccess: string;
};
