
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { OutreachSubscription } from '@/types/outreach';
import { Language, TranslationDict, getTranslation } from '../../pages/Settings/LanguageSettings';

interface OutreachSubscriptionFormProps {
  language: Language;
}

export const OutreachSubscriptionForm = ({ language }: OutreachSubscriptionFormProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Function to translate based on current language
  const t = (key: keyof TranslationDict): string => getTranslation(language, key);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: t('enterEmail'),
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if email already exists
      const { data: existingData, error: existingError } = await supabase
        .from<OutreachSubscription>('outreach_subscriptions')
        .select('*')
        .eq('email', email)
        .single();
      
      if (existingError && existingError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is expected if user isn't subscribed
        console.error('Error checking subscription:', existingError);
        throw existingError;
      }
      
      if (existingData) {
        toast({
          title: t('alreadyRegistered'),
          variant: "default"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Insert new subscription
      const { error } = await supabase
        .from<OutreachSubscription>('outreach_subscriptions')
        .insert([
          { 
            email, 
            user_id: user?.id || null 
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: t('thankYou'),
        variant: "default"
      });
      
      setEmail('');
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast({
        title: "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto p-6 backdrop-blur-sm bg-background/70 border-primary/20 shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <h3 className="text-xl font-medium mb-4 flex items-center justify-center">
        <Zap className="w-5 h-5 mr-2 text-yellow-500" />
        {t('stayUpdated')}
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit" 
          className="whitespace-nowrap" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <span className="animate-spin mr-2">◌</span>
              ...
            </div>
          ) : t('notifyMe')}
        </Button>
      </form>
    </Card>
  );
};
