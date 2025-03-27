
import { StyleOption, PersonaFunction } from '@/types/persona';

export const predefinedStyles: StyleOption[] = [
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Warm, approachable tone that builds rapport',
    tone: 'Warm and conversational',
    icon: 'smile',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Polished, business-appropriate communication',
    tone: 'Formal but accessible',
    icon: 'briefcase',
  },
  {
    id: 'executive',
    name: 'Executive (C-Level)',
    description: 'Concise, strategic, and leadership-oriented',
    tone: 'Authoritative and strategic',
    icon: 'award',
  },
  {
    id: 'humorous',
    name: 'Humorous',
    description: 'Light-hearted with appropriate humor',
    tone: 'Witty and engaging',
    icon: 'laugh',
  },
  {
    id: 'technical',
    name: 'IT/Technical',
    description: 'Technical language for IT professionals',
    tone: 'Precise and technically informed',
    icon: 'code',
  },
  {
    id: 'startup',
    name: 'Casual Start-Up Tone',
    description: 'Innovative, agile, and modern language',
    tone: 'Casual yet professional',
    icon: 'zap',
  },
  {
    id: 'formal',
    name: 'Formal/Polite',
    description: 'Highly respectful and traditional',
    tone: 'Very formal and respectful',
    icon: 'check-circle',
  },
  {
    id: 'marketing',
    name: 'Marketing-Focused',
    description: 'Persuasive with strong calls to action',
    tone: 'Persuasive and benefit-oriented',
    icon: 'target',
  },
  {
    id: 'sales',
    name: 'Sales-Oriented',
    description: 'Direct with clear value propositions',
    tone: 'Persuasive with clear benefits',
    icon: 'shopping-cart',
  },
  {
    id: 'analytical',
    name: 'Analytical/Insightful',
    description: 'Data-driven with logical reasoning',
    tone: 'Factual and evidence-based',
    icon: 'bar-chart',
  },
];

export const predefinedFunctions: PersonaFunction[] = [
  {
    id: 'new-leads',
    name: 'Contacting New Leads',
    description: 'First outreach to new potential clients',
    icon: 'user-plus',
  },
  {
    id: 'follow-up',
    name: 'Follow-Up Emails',
    description: 'Check-ins after initial contact',
    icon: 'repeat',
  },
  {
    id: 'scheduling',
    name: 'Scheduling Calls/Meetings',
    description: 'Setting up appointments with clients',
    icon: 'calendar',
  },
  {
    id: 'proposal',
    name: 'Sending Proposals',
    description: 'Presenting offers to potential clients',
    icon: 'file-text',
  },
  {
    id: 'onboarding',
    name: 'Client Onboarding',
    description: 'Welcoming and setting up new clients',
    icon: 'log-in',
  },
  {
    id: 'feedback',
    name: 'Requesting Feedback',
    description: 'Asking for client reviews or input',
    icon: 'message-square',
  },
  {
    id: 'newsletter',
    name: 'Newsletter Communication',
    description: 'Regular updates to your network',
    icon: 'mail',
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Technical or account assistance',
    icon: 'life-buoy',
  },
];

export const generatePrompt = (persona: { name: string, function: string, style: string }): string => {
  const selectedStyle = predefinedStyles.find(s => s.id === persona.style) || 
    { name: persona.style, tone: persona.style };
  
  const selectedFunction = predefinedFunctions.find(f => f.id === persona.function) || 
    { name: persona.function, description: persona.function };

  return `Act as a professional ${selectedFunction.name} specialist named ${persona.name}.
  
Write in a ${selectedStyle.tone} tone that's appropriate for ${selectedFunction.description}.

Your communication should be:
- Clear and concise
- Focused on the recipient's needs
- Helpful and actionable
- Professional while maintaining the ${selectedStyle.name} style

Avoid:
- Overly technical jargon (unless responding to IT/Technical requests)
- Generic or vague statements
- Pushy or aggressive language
- Lengthy paragraphs that are difficult to scan

This persona is specifically designed for ${selectedFunction.description} communications.`;
};
