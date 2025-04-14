
import React from 'react';
import { X, MessageCircle, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Contact {
  name: string;
  role: string;
  company: string;
  confidence: number;
  contactStrategy: string;
}

interface ContactStrategy {
  title: string;
  description: string;
  steps: string[];
}

interface AISuggestion {
  contactStrategy: ContactStrategy;
  potentialContacts: Contact[];
  messageSuggestion: string;
}

interface AIContactSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: AISuggestion;
}

const AIContactSuggestionModal: React.FC<AIContactSuggestionModalProps> = ({ 
  isOpen, 
  onClose, 
  suggestion 
}) => {
  if (!isOpen || !suggestion) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            KI-Kontaktvorschlag
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow p-6">
          <div className="grid gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{suggestion.contactStrategy.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {suggestion.contactStrategy.description}
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h4 className="font-medium mb-2">Empfohlene Schritte:</h4>
                <ol className="space-y-2 list-decimal list-inside">
                  {suggestion.contactStrategy.steps.map((step, index) => (
                    <li key={index} className="text-sm">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">Potenzielle Kontakte</h3>
              <div className="space-y-4">
                {suggestion.potentialContacts.map((contact, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-600" />
                          {contact.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {contact.role} bei {contact.company}
                        </div>
                        <div className="text-sm mt-2">
                          <span className="font-medium">Kontaktmethode:</span> {contact.contactStrategy}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm mb-1">Übereinstimmung</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={contact.confidence * 100} className="h-2 w-16" />
                          <span className="text-sm font-medium">{Math.round(contact.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium flex items-center mb-3">
                <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                Nachrichtenvorschlag
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {suggestion.messageSuggestion}
                </pre>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(suggestion.messageSuggestion);
                    // You could add a toast notification here
                  }}
                  variant="outline"
                  className="text-sm"
                >
                  In Zwischenablage kopieren
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <Button onClick={onClose}>
            Schließen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIContactSuggestionModal;
