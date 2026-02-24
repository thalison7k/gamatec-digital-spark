
-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Enum para status de projeto
CREATE TYPE public.project_status AS ENUM (
  'awaiting_info',
  'in_development', 
  'in_review',
  'awaiting_approval',
  'published'
);

-- Enum para prioridade de ticket
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high');

-- Enum para status de ticket
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'awaiting_client', 'completed');

-- Enum para tipo de serviço
CREATE TYPE public.service_type AS ENUM (
  'landing_page',
  'institutional_site',
  'blog',
  'ecommerce',
  'web_app',
  'other'
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'client',
  UNIQUE (user_id, role)
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  service_type service_type NOT NULL DEFAULT 'landing_page',
  status project_status NOT NULL DEFAULT 'awaiting_info',
  estimated_delivery DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project materials table
CREATE TABLE public.project_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  business_description TEXT,
  desired_colors TEXT,
  social_media TEXT,
  phone_whatsapp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ticket messages table
CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PROJECTS policies
CREATE POLICY "Clients can view own projects" ON public.projects FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can do everything on projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PROJECT_MATERIALS policies
CREATE POLICY "Project owners can view materials" ON public.project_materials FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
);
CREATE POLICY "Project owners can insert materials" ON public.project_materials FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
  AND auth.uid() = uploaded_by
);
CREATE POLICY "Admins can do everything on materials" ON public.project_materials FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- TICKETS policies
CREATE POLICY "Clients can view own tickets" ON public.tickets FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Clients can create tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can do everything on tickets" ON public.tickets FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- TICKET_MESSAGES policies
CREATE POLICY "Ticket participants can view messages" ON public.ticket_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tickets WHERE id = ticket_id AND (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Ticket participants can send messages" ON public.ticket_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM public.tickets WHERE id = ticket_id AND (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Admins can do everything on messages" ON public.ticket_messages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for project materials
INSERT INTO storage.buckets (id, name, public) VALUES ('project-materials', 'project-materials', false);

CREATE POLICY "Project owners can upload materials" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'project-materials' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Project owners can view own materials" ON storage.objects FOR SELECT USING (
  bucket_id = 'project-materials' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Admins can access all materials" ON storage.objects FOR ALL USING (
  bucket_id = 'project-materials' AND public.has_role(auth.uid(), 'admin')
);

-- Enable realtime for tickets and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
