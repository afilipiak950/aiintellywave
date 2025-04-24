
import { useState } from 'react';
import { useAuth } from '../../context/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from "../../hooks/use-toast";
import { LoginAnimation } from "../../components/auth/LoginAnimation";
import { LoginForm } from "../../components/auth/LoginForm";
import { SocialLoginButtons } from "../../components/auth/SocialLoginButtons";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("Login attempt for:", email);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error.message);
        
        // User-friendly error messages
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login failed",
            description: "Invalid login credentials. Please check your email and password.",
            variant: "destructive"
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email not confirmed",
            description: "Please confirm your email address before logging in.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message || "An error occurred. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        console.log("Login successful");
        
        // Special message for admin login
        if (email === 'admin@intellywave.de') {
          toast({
            title: "Welcome, Administrator!",
            description: "You are being redirected to the admin dashboard.",
          });
          navigate('/admin/dashboard');
        } else if (email.includes('manager')) {
          toast({
            title: "Welcome back, Manager!",
            description: "You have successfully logged in.",
          });
          navigate('/manager/dashboard');
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate('/customer/dashboard');
        }
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
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
