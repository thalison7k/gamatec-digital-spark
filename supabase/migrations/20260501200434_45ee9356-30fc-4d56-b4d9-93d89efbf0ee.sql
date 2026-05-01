-- =========================================================
-- 1) REALTIME: escopar por usuário (topic com user_id)
-- =========================================================

DROP POLICY IF EXISTS "Authenticated users can read realtime messages" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can subscribe to realtime" ON realtime.messages;

-- Topic format expected: "<user_id>:<channel>" or topic containing the user's uid
CREATE POLICY "Users can read own realtime messages"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  (auth.uid()::text = split_part(realtime.topic(), ':', 1))
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can subscribe to own realtime topics"
ON realtime.messages FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid()::text = split_part(realtime.topic(), ':', 1))
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- =========================================================
-- 2) USER_ROLES: write policies somente para authenticated
-- =========================================================

DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- 3) STORAGE: remover política redundante (se existir)
-- =========================================================

DROP POLICY IF EXISTS "Project owners can view own materials" ON storage.objects;
