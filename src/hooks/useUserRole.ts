/**
 * ============================================================
 * useUserRole — Hook de Papel/Permissão do Usuário
 * ============================================================
 * Lê a tabela `user_roles` para descobrir se o usuário logado
 * é "admin" ou "client". Usado para gating de rotas
 * administrativas (ver AdminRoute em App.tsx).
 *
 * - Default seguro: trata ausência de registro como "client".
 * - Usa maybeSingle para silenciar erro 406 quando não há linha.
 * ============================================================
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<"admin" | "client" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      // Sem registro encontrado → assume "client" (papel padrão)
      setRole((data?.role as "admin" | "client") ?? "client");
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  return { role, isAdmin: role === "admin", loading };
};
