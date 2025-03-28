import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/auth';
import { AnimatedBackgroundWrapper } from '@/components/mira-ai/AnimatedBackgroundWrapper';
import AIAgentsDashboard from '@/components/home/AIAgentsDashboard';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <AnimatedBackgroundWrapper>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
              Die Zukunft der KI-gestützten Geschäftsprozesse
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Nutzen Sie die Kraft der künstlichen Intelligenz, um Ihre Arbeitsabläufe zu optimieren, 
              Leads zu generieren und den Erfolg Ihres Unternehmens zu steigern.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => navigate('/dashboard')}
                >
                  Zum Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => navigate('/register')}
                  >
                    Kostenlos starten
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-200 dark:border-blue-800"
                    onClick={() => navigate('/login')}
                  >
                    Anmelden
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Interaktives AI-Agenten Dashboard */}
          <div className="max-w-5xl mx-auto my-12">
            <AIAgentsDashboard />
          </div>
          
          {/* Weitere Sektionen... */}
        </div>
      </div>
    </AnimatedBackgroundWrapper>
  );
};

export default Index;
