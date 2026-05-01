-- =========================================================
-- 1) Restringir TODAS as políticas a {authenticated}
-- =========================================================

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- projects
DROP POLICY IF EXISTS "Admins can do everything on projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can view own projects" ON public.projects;

CREATE POLICY "Admins can do everything on projects"
ON public.projects FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view own projects"
ON public.projects FOR SELECT TO authenticated
USING (auth.uid() = client_id);

-- project_materials
DROP POLICY IF EXISTS "Admins can do everything on materials" ON public.project_materials;
DROP POLICY IF EXISTS "Project owners can insert materials" ON public.project_materials;
DROP POLICY IF EXISTS "Project owners can view materials" ON public.project_materials;

CREATE POLICY "Admins can do everything on materials"
ON public.project_materials FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Project owners can insert materials"
ON public.project_materials FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_materials.project_id
      AND projects.client_id = auth.uid()
  )
  AND auth.uid() = uploaded_by
);

CREATE POLICY "Project owners can view materials"
ON public.project_materials FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_materials.project_id
      AND projects.client_id = auth.uid()
  )
);

-- tickets
DROP POLICY IF EXISTS "Admins can do everything on tickets" ON public.tickets;
DROP POLICY IF EXISTS "Clients can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Clients can view own tickets" ON public.tickets;

CREATE POLICY "Admins can do everything on tickets"
ON public.tickets FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can create tickets"
ON public.tickets FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Clients can view own tickets"
ON public.tickets FOR SELECT TO authenticated
USING (auth.uid() = created_by);

-- ticket_messages
DROP POLICY IF EXISTS "Admins can do everything on messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Ticket participants can send messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Ticket participants can view messages" ON public.ticket_messages;

CREATE POLICY "Admins can do everything on messages"
ON public.ticket_messages FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Ticket participants can send messages"
ON public.ticket_messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.tickets
    WHERE tickets.id = ticket_messages.ticket_id
      AND (tickets.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Ticket participants can view messages"
ON public.ticket_messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tickets
    WHERE tickets.id = ticket_messages.ticket_id
      AND (tickets.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

-- user_roles (já reforçada — só converter de public para authenticated nas SELECT)
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- 2) NOTIFICATIONS: remover self-insert por usuário
-- =========================================================

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
-- Mantém: "Admins can insert notifications" (já existe e é o correto)

-- =========================================================
-- 3) REALTIME: exigir autenticação para assinar tópicos
-- =========================================================

-- Garantir RLS habilitado em realtime.messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read realtime messages" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can subscribe to realtime" ON realtime.messages;

-- Apenas usuários autenticados podem receber broadcasts/presence
CREATE POLICY "Authenticated users can read realtime messages"
ON realtime.messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can subscribe to realtime"
ON realtime.messages FOR INSERT
TO authenticated
WITH CHECK (true);
