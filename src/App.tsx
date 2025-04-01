
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import AuthRedirect from "./components/auth/AuthRedirect";
import { AppRoutes } from "./routes/AppRoutes";
import { useState, useEffect } from "react";
import { useTheme } from "./hooks/use-theme";

const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  const { theme, isLoading } = useTheme();
  
  useEffect(() => {
    // Apply theme on component mount
    if (!isLoading) {
      const resolvedTheme = theme === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
      
      if (resolvedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, isLoading]);
  
  // Show loading state while theme is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const App = () => {
  // Create a new QueryClient instance for each render to avoid shared state issues
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Disable automatic refetching which can cause suspense issues
        refetchOnWindowFocus: false,
        retry: 1,
        // Use throwOnError: false to prevent components from suspending unexpectedly
        throwOnError: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <ThemeInitializer>
              <Toaster />
              <Sonner />
              <AuthRedirect />
              <AppRoutes />
            </ThemeInitializer>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
