
import React from 'react';
import { Mail, Clock } from 'lucide-react';

interface SequencesTabContentProps {
  campaign: any;
}

export function SequencesTabContent({ campaign }: SequencesTabContentProps) {
  // Default sequence emails to match the screenshot if none are available
  const sequenceEmails = campaign?.sequence_emails || [
    { id: 1, subject: '{use_ai_agent}', content: '{use_ai_agent}', waitDays: 2 },
    { id: 2, subject: '{use_ai_agent}', content: '{use_ai_agent}', waitDays: 2 },
    { id: 3, subject: 'Ein kurzer Reminder', content: 'Hallo {firstName},\n\nIch wollte nur sicherstellen, dass Sie meine vorherigen E-Mails gesehen haben. Unsere Lösungen haben vielen kleinen Unternehmen geholfen, ihre Online-Präsenz zu verbessern. Ich würde mich freuen, Ihnen einige Beispiele zu zeigen.\n\nKönnten wir uns nächste Woche kurz unterhalten?\n\nHerzliche Grüße,\n{sendingAccountFirstName}', waitDays: 2 },
    { id: 4, subject: '{use_ai_agent}', content: '{use_ai_agent}', waitDays: 2 },
    { id: 5, subject: '{use_ai_agent}', content: '{use_ai_agent}', waitDays: 2 },
  ];

  return (
    <div className="bg-white rounded-md p-6">
      <h3 className="text-lg font-semibold mb-6">Sequence 1</h3>
      
      <div className="space-y-6">
        {sequenceEmails.map((email, index) => (
          <div key={index} className="relative">
            {/* Email icon and number */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-500" />
              </div>
              <div className="font-medium">Email {index + 1}</div>
              
              {/* Wait days badge */}
              <div className="ml-2 flex items-center gap-1 bg-gray-100 rounded-md px-3 py-1 text-sm">
                <Clock className="h-3 w-3 text-gray-500" />
                <span>Wait {email.waitDays} days</span>
              </div>
            </div>
            
            {/* Email content */}
            <div className="ml-16">
              <div className="mb-2 text-sm font-medium">Subject: {email.subject}</div>
              <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap text-sm text-gray-600">
                {email.content}
              </div>
            </div>
            
            {/* Connector line to next email */}
            {index < sequenceEmails.length - 1 && (
              <div className="ml-6 h-8 border-l-2 border-gray-200 my-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
