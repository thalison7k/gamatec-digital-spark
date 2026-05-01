-- =========================================================
-- 1) USER_ROLES: bloquear totalmente self-grant de admin
-- =========================================================

-- Remove políticas existentes que poderiam permitir brechas
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Recria as políticas de forma segura (cobrindo public = anon + authenticated)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO public
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO public
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO public
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO public
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO public
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- 2) SECURITY DEFINER FUNCTIONS: revogar EXECUTE público
-- =========================================================

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role precisa ser chamável pelas próprias políticas RLS (SECURITY DEFINER cuida disso),
-- mas o RLS executa como o usuário; então mantemos EXECUTE para o postgres role apenas.
-- As políticas continuam funcionando porque has_role é SECURITY DEFINER e roda com o owner.
-- Garantimos isso explicitamente:
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO postgres, service_role;

-- =========================================================
-- 3) STORAGE: políticas explícitas para project-materials
-- =========================================================

DROP POLICY IF EXISTS "Project owners can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Project owners can update materials" ON storage.objects;
DROP POLICY IF EXISTS "Project owners can delete materials" ON storage.objects;
DROP POLICY IF EXISTS "Project owners can view materials files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all project materials" ON storage.objects;

-- SELECT: dono do projeto pode visualizar
CREATE POLICY "Project owners can view materials files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-materials'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.client_id = auth.uid()
      AND (storage.foldername(name))[1] = p.id::text
  )
);

-- INSERT: dono do projeto pode enviar
CREATE POLICY "Project owners can upload materials"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-materials'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.client_id = auth.uid()
      AND (storage.foldername(name))[1] = p.id::text
  )
);

-- UPDATE: dono do projeto pode atualizar
CREATE POLICY "Project owners can update materials"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-materials'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.client_id = auth.uid()
      AND (storage.foldername(name))[1] = p.id::text
  )
);

-- DELETE: dono do projeto pode apagar
CREATE POLICY "Project owners can delete materials"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-materials'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.client_id = auth.uid()
      AND (storage.foldername(name))[1] = p.id::text
  )
);

-- ADMIN: acesso total ao bucket
CREATE POLICY "Admins can manage all project materials"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'project-materials'
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'project-materials'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
