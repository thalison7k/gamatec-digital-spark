/**
 * ============================================================
 * App.tsx — Raiz da Aplicação GamaTec.IA
 * ============================================================
 * Responsabilidades principais:
 *  1. Encadear todos os Providers globais (Auth, Tema, Sons,
 *     Voz/TTS, Acessibilidade, React Query, Tooltip).
 *  2. Definir as rotas e gates de proteção:
 *     - ProtectedRoute → exige usuário logado
 *     - AdminRoute     → exige role = 'admin'
 *     - AuthRedirect   → manda para /site se já estiver logado
 *  3. Carregar páginas pesadas via lazy() para acelerar o boot.
 *
 * Fluxo de acesso:
 *   /          → Login (ou redireciona para /site se logado)
 *   /auth      → Login
 *   /site      → Site institucional (protegido)
 *   /dashboard → Painel do cliente (protegido)
 *   /dashboard/configuracoes  → Preferências do usuário
 *   /dashboard/admin|clients  → Apenas admins
 *   /como-funciona            → Documentação técnica (TCC)
 * ============================================================
 */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SoundProvider } from "@/components/SoundProvider";
import { ThemeProvider } from "@/hooks/useTheme";
import { AccessibilityProvider } from "@/hooks/useAccessibility";
import { VoiceProvider } from "@/components/VoiceProvider";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import Auth from "./pages/Auth";
import { useUserRole } from "@/hooks/useUserRole";

// ===== Páginas carregadas sob demanda (code-splitting) =====
const Index = lazy(() => import("./pages/Index"));
const ComoFunciona = lazy(() => import("./pages/ComoFunciona"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const Tickets = lazy(() => import("./pages/Tickets"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Cliente único do React Query (cache global de requisições)
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

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-orbitron text-xl">Verificando permissões...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
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
            <VoiceProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {/* ===== Roteador da aplicação =====
                  future flags ativam o comportamento do React Router v7 antecipadamente,
                  eliminando os warnings de deprecação no console. */}
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm">
                  Pular para o conteúdo principal
                </a>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-primary font-orbitron">Carregando...</div></div>}>
                  <Routes>
                    <Route path="/" element={<AuthRedirect />} />
                    <Route path="/auth" element={<AuthRedirect />} />
                    <Route path="/site" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/dashboard/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
                    <Route path="/dashboard/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
                    <Route path="/dashboard/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
                    <Route path="/dashboard/admin" element={<ProtectedRoute><AdminRoute><AdminPanel /></AdminRoute></ProtectedRoute>} />
                    <Route path="/dashboard/clients" element={<ProtectedRoute><AdminRoute><AdminPanel /></AdminRoute></ProtectedRoute>} />
                    <Route path="/como-funciona" element={<ProtectedRoute><ComoFunciona /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <AccessibilityPanel />
                <PWAInstallPrompt />
                <ScrollToTop />
              </BrowserRouter>
            </TooltipProvider>
            </VoiceProvider>
          </SoundProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
