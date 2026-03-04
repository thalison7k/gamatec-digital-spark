import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SoundProvider } from "@/components/SoundProvider";
import { ThemeProvider } from "@/hooks/useTheme";
import { AccessibilityProvider } from "@/hooks/useAccessibility";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { ScrollToTop } from "@/components/ScrollToTop";
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
  if (user) return <Navigate to="/site" replace />;
  return <Auth />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          <SoundProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm">
                  Pular para o conteúdo principal
                </a>
                <Routes>
                  <Route path="/" element={<AuthRedirect />} />
                  <Route path="/auth" element={<AuthRedirect />} />
                  <Route path="/site" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/dashboard/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
                  <Route path="/dashboard/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
                  <Route path="/dashboard/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                  <Route path="/dashboard/clients" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                  <Route path="/como-funciona" element={<ProtectedRoute><ComoFunciona /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <AccessibilityPanel />
                <ScrollToTop />
              </BrowserRouter>
            </TooltipProvider>
          </SoundProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
