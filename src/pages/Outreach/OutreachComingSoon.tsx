
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { Bot, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { getCurrentLanguage, getTranslation } from '../Settings/LanguageSettings';

const OutreachComingSoon = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const language = getCurrentLanguage();
  
  // Function to translate based on current language
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      'en': {
        'comingSoon': 'Coming Soon',
        'outreachFeature': 'Outreach Feature',
        'description': 'We\'re working on something exciting! Our new outreach platform will help you connect with your audience like never before.',
        'stayUpdated': 'Stay Updated',
        'emailPlaceholder': 'Enter your email',
        'notifyMe': 'Notify Me',
        'thankYou': 'Thank you! We\'ll notify you when we launch.',
        'alreadyRegistered': 'You\'re already registered for updates!',
        'enterEmail': 'Please enter a valid email address'
      },
      'de': {
        'comingSoon': 'In Entwicklung',
        'outreachFeature': 'Outreach-Funktion',
        'description': 'Wir arbeiten an etwas Aufregendem! Unsere neue Outreach-Plattform wird Ihnen helfen, sich mit Ihrem Publikum wie nie zuvor zu verbinden.',
        'stayUpdated': 'Bleiben Sie auf dem Laufenden',
        'emailPlaceholder': 'E-Mail-Adresse eingeben',
        'notifyMe': 'Benachrichtigen Sie mich',
        'thankYou': 'Vielen Dank! Wir werden Sie benachrichtigen, wenn wir starten.',
        'alreadyRegistered': 'Sie sind bereits für Updates registriert!',
        'enterEmail': 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
      },
      'fr': {
        'comingSoon': 'Bientôt Disponible',
        'outreachFeature': 'Fonctionnalité de Sensibilisation',
        'description': 'Nous travaillons sur quelque chose d\'excitant ! Notre nouvelle plateforme de sensibilisation vous aidera à vous connecter avec votre audience comme jamais auparavant.',
        'stayUpdated': 'Restez Informé',
        'emailPlaceholder': 'Entrez votre email',
        'notifyMe': 'Me Notifier',
        'thankYou': 'Merci ! Nous vous informerons lors du lancement.',
        'alreadyRegistered': 'Vous êtes déjà inscrit pour les mises à jour !',
        'enterEmail': 'Veuillez entrer une adresse email valide'
      },
      'es': {
        'comingSoon': 'Próximamente',
        'outreachFeature': 'Función de Divulgación',
        'description': '¡Estamos trabajando en algo emocionante! Nuestra nueva plataforma de divulgación le ayudará a conectarse con su audiencia como nunca antes.',
        'stayUpdated': 'Manténgase Actualizado',
        'emailPlaceholder': 'Introduzca su correo electrónico',
        'notifyMe': 'Notifíqueme',
        'thankYou': '¡Gracias! Le notificaremos cuando lancemos.',
        'alreadyRegistered': '¡Ya está registrado para recibir actualizaciones!',
        'enterEmail': 'Por favor, introduzca una dirección de correo electrónico válida'
      }
    };
    
    return translations[language]?.[key] || translations['en'][key];
  };

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
      const { data: existingData } = await supabase
        .from('outreach_subscriptions')
        .select('*')
        .eq('email', email)
        .single();
      
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
        .from('outreach_subscriptions')
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
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-background to-indigo-950/20">
      {/* Background animated agents */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <AnimatedAgents />
      </div>
      
      <div className="container relative z-10 px-4 py-24 mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="relative inline-flex items-center justify-center p-3 bg-primary/10 rounded-full animate-pulse">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 animate-fade-in">
            {t('comingSoon')}
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="h-px w-8 bg-primary/40"></span>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground/90 inline-flex items-center">
              {t('outreachFeature')} <Bot className="ml-2 w-6 h-6 text-primary animate-bounce" />
            </h2>
            <span className="h-px w-8 bg-primary/40"></span>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            {t('description')}
          </p>
          
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
        </div>
        
        {/* Floating elements animation */}
        <div className="absolute top-20 right-10 animate-float">
          <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md"></div>
        </div>
        <div className="absolute bottom-40 left-20 animate-float-delay">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 backdrop-blur-md"></div>
        </div>
        <div className="absolute top-1/2 right-1/4 animate-float-slow">
          <div className="w-20 h-20 rounded-full bg-primary/10 backdrop-blur-md"></div>
        </div>
      </div>
    </div>
  );
};

export default OutreachComingSoon;
