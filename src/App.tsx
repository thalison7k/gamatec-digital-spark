import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SoundProvider } from "@/components/SoundProvider";
import { SoundToggle } from "@/components/SoundToggle";
import { ThemeProvider } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ComoFunciona from "./pages/ComoFunciona";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import Tickets from "./pages/Tickets";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-orbitron text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AuthRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Auth />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <SoundProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthRedirect />} />
                <Route path="/" element={<Index />} />
                <Route path="/como-funciona" element={<ComoFunciona />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
                <Route path="/dashboard/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
                <Route path="/dashboard/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                <Route path="/dashboard/clients" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <SoundToggle />
              <ThemeToggle />
            </BrowserRouter>
          </TooltipProvider>
        </SoundProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
