
import React from 'react';
import { Mail, Clock } from 'lucide-react';

interface SequencesTabContentProps {
  campaign: any;
}

export function SequencesTabContent({ campaign }: SequencesTabContentProps) {
  // Default sequence emails if not available
  const sequenceEmails = campaign?.sequence_emails || [
    { id: 1, subject: '{use_ai_agent}', content: '{use_ai_agent}', waitDays: 2 },
    { id: 2, subject: '{use_ai_agent}', content: '{use_ai_agent}', waitDays: 2 },
    { id: 3, subject: 'Ein kurzer Reminder', content: 'Hallo {firstName},Ich wollte nur sicherstellen, dass Sie meine vorherigen E-Mails gesehen haben. Unsere Lösungen haben vielen kleinen Unternehmen geholfen, ihre Online-Präsenz zu verbessern. Ich würde mich freuen, Ihnen einige Beispiele zu zeigen.Könnten wir uns nächste Woche kurz unterhalten?Herzliche Grüße,{sendingAccountFirstName}', waitDays: 2 },
    { id: 4, subject: '{use_ai_agent}', content: '{use_ai_agent}', waitDays: 2 },
    { id: 5, subject: '{use_ai_agent}', content: '{use_ai_agent}', waitDays: 2 },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Sequence 1</h3>
      
      <div className="space-y-8">
        {sequenceEmails.map((email: any, index: number) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-500" />
              </div>
              
              <div className="font-medium">Email {index + 1}</div>
              
              <div className="ml-2 px-3 py-1 bg-gray-100 rounded-md text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Wait {email.waitDays} days</span>
              </div>
            </div>
            
            <div className="ml-16 space-y-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Subject: {email.subject}</div>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600 whitespace-pre-wrap">
                  {email.content}
                </div>
              </div>
            </div>
            
            {index < sequenceEmails.length - 1 && (
              <div className="mt-6 ml-6 border-l-2 border-gray-200 h-6"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
