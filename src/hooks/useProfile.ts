/**
 * ============================================================
 * useProfile — Hook de Perfil do Usuário
 * ============================================================
 * Carrega o perfil estendido (full_name, phone) do usuário
 * autenticado a partir da tabela `profiles`.
 *
 * - Usa `maybeSingle()` para não logar erro 406 quando não há
 *   linha (perfil ainda não criado pelo trigger handle_new_user).
 * - Estado local `profile` é resetado quando o usuário desloga.
 * ============================================================
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sem usuário logado → limpa estado e encerra loading
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      // maybeSingle evita o ruído de erro 406/PGRST116 quando
      // ainda não existe perfil para o usuário recém-criado.
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(data as Profile | null);
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  return { profile, loading };
};

