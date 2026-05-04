-- Revoga EXECUTE público em funções SECURITY DEFINER que não devem ser
-- chamadas diretamente por usuários autenticados.
-- Elas continuam funcionando dentro de RLS policies e triggers,
-- pois esses contextos rodam com privilégio interno do Postgres.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;