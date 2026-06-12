-- 1) Realtime: substitui POSITION/substring match por correspondência exata de prefixo "user:<uid>"
DROP POLICY IF EXISTS "Users can read own realtime messages" ON realtime.messages;
DROP POLICY IF EXISTS "Users can subscribe to own realtime topics" ON realtime.messages;

CREATE POLICY "Users can read own realtime messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = ('user:' || (auth.uid())::text)
  OR private.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Users can subscribe to own realtime topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() = ('user:' || (auth.uid())::text)
  OR private.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 2) Storage: substitui public.has_role por private.has_role na política de admin
DROP POLICY IF EXISTS "Admins can manage all project materials" ON storage.objects;

CREATE POLICY "Admins can manage all project materials"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'project-materials'
  AND private.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'project-materials'
  AND private.has_role(auth.uid(), 'admin'::public.app_role)
);