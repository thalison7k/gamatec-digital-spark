
-- Conversation history table for both assistants
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assistant_type TEXT NOT NULL DEFAULT 'smart',
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
ON public.chat_conversations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert own conversations
CREATE POLICY "Users can insert own conversations"
ON public.chat_conversations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own conversations
CREATE POLICY "Users can update own conversations"
ON public.chat_conversations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete own conversations (LGPD)
CREATE POLICY "Users can delete own conversations"
ON public.chat_conversations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
ON public.chat_conversations FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
