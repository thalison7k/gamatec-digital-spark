/**
 * ============================================================
 * useAuth — Contexto Global de Autenticação
 * ============================================================
 * Expõe o usuário logado, sessão e função de logout para todo
 * o app via Context API. Estratégia recomendada pelo Supabase:
 *
 *   1. Registra o listener `onAuthStateChange` PRIMEIRO
 *      (para não perder eventos durante o boot).
 *   2. DEPOIS chama `getSession()` para hidratar o estado
 *      inicial com a sessão persistida no localStorage.
 *
 * Componentes consumidores: ProtectedRoute, Navbar, Dashboard,
 * Configuracoes, etc.
 * ============================================================
 */
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session.
    // Se o refresh token estiver inválido/ausente (ex.: sessão antiga),
    // limpamos o storage para evitar 401/403 em chamadas subsequentes.
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
