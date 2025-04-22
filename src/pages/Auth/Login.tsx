
import { useState } from 'react';
import { useAuth } from '../../context/auth';
import { toast } from "../../hooks/use-toast";
import { LoginAnimation } from "../../components/auth/LoginAnimation";
import { LoginForm } from "../../components/auth/LoginForm";
import { SocialLoginButtons } from "../../components/auth/SocialLoginButtons";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("Login-Versuch für:", email);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login-Fehler:", error.message);
        
        // Benutzerfreundliche Fehlermeldungen
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login fehlgeschlagen",
            description: "Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.",
            variant: "destructive"
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            title: "E-Mail nicht bestätigt",
            description: "Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie sich anmelden.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Login fehlgeschlagen",
            description: error.message || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
            variant: "destructive"
          });
        }
      } else {
        console.log("Login erfolgreich");
        
        // Special message for admin login
        if (email === 'admin@intellywave.de') {
          toast({
            title: "Willkommen, Administrator!",
            description: "Sie werden zum Admin-Dashboard weitergeleitet.",
          });
        } else {
          toast({
            title: "Willkommen zurück!",
            description: "Sie haben sich erfolgreich angemeldet.",
          });
        }
      }
    } catch (err) {
      console.error("Unerwarteter Login-Fehler:", err);
      toast({
        title: "Login-Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Linke Seite mit Animation */}
      <LoginAnimation />

      {/* Rechte Seite mit Login-Formular */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg animate-scale-in mx-4">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
              Anmelden
            </h2>
          </div>
          
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          
          <SocialLoginButtons />
        </div>
      </div>
    </div>
  );
};

export default Login;
