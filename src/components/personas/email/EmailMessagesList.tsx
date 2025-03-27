
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { EmailMessage } from '@/types/persona';
import { Mail, Sparkles } from 'lucide-react';

interface EmailMessagesListProps {
  displayedEmails: EmailMessage[];
  selectedEmails: string[];
  isEmailListExpanded: boolean;
  toggleSelectEmail: (emailId: string) => void;
  handleViewAnalysis: (email: EmailMessage) => void;
  handleToggleExpand: () => void;
  emailMessages: EmailMessage[];
}

export function EmailMessagesList({
  displayedEmails,
  selectedEmails,
  isEmailListExpanded,
  toggleSelectEmail,
  handleViewAnalysis,
  handleToggleExpand,
  emailMessages
}: EmailMessagesListProps) {
  if (displayedEmails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-md bg-muted/20 animate-pulse">
        <Mail className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">No email content imported yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedEmails.map((message) => (
        <div 
          key={message.id} 
          className="flex items-start gap-2 p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
        >
          <Checkbox
            checked={selectedEmails.includes(message.id)}
            onCheckedChange={() => toggleSelectEmail(message.id)}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground flex items-center">
                {message.sender && (
                  <span className="font-medium mr-2">From: {message.sender}</span>
                )}
                {message.created_at && (
                  <span>{format(new Date(message.created_at), 'MMM d, yyyy')}</span>
                )}
              </p>
            </div>
            
            {message.subject && (
              <p className="font-medium truncate mb-1">{message.subject}</p>
            )}
            
            <p className="text-sm line-clamp-2">
              {message.body.substring(0, 150)}...
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="shrink-0 ml-2 flex items-center gap-1 hover:bg-background/50"
            onClick={() => handleViewAnalysis(message)}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Analysis</span>
          </Button>
        </div>
      ))}
      
      {emailMessages.length > 5 && (
        <Button
          variant="ghost" 
          size="sm" 
          className="w-full text-center text-xs text-muted-foreground"
          onClick={handleToggleExpand}
        >
          {isEmailListExpanded ? (
            <>Show Less</>
          ) : (
            <>Show {emailMessages.length - 5} More</>
          )}
        </Button>
      )}
    </div>
  );
}
