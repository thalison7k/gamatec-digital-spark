DROP POLICY IF EXISTS "Users can read own realtime messages" ON realtime.messages;
DROP POLICY IF EXISTS "Users can subscribe to own realtime topics" ON realtime.messages;

CREATE POLICY "Users can read own realtime messages"
ON realtime.messages FOR SELECT TO authenticated
USING (
  position(auth.uid()::text in realtime.topic()) > 0
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can subscribe to own realtime topics"
ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (
  position(auth.uid()::text in realtime.topic()) > 0
  OR public.has_role(auth.uid(), 'admin'::app_role)
);