
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import AuthRedirect from "./components/auth/AuthRedirect";
import { AppRoutes } from "./routes/AppRoutes";
import { useState } from "react";

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
            <Toaster />
            <Sonner />
            <AuthRedirect />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
