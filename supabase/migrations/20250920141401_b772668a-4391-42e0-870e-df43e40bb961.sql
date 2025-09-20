-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create transport lines table
CREATE TABLE public.transport_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  number TEXT NOT NULL,
  color TEXT DEFAULT '#2563EB',
  route_description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transport_lines ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing
CREATE POLICY "Transport lines are viewable by everyone" 
ON public.transport_lines 
FOR SELECT 
USING (true);

-- Create transport stops table
CREATE TABLE public.transport_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_id UUID NOT NULL REFERENCES public.transport_lines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transport_stops ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing
CREATE POLICY "Transport stops are viewable by everyone" 
ON public.transport_stops 
FOR SELECT 
USING (true);

-- Create transport reports table
CREATE TABLE public.transport_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_id UUID NOT NULL REFERENCES public.transport_lines(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transport_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Transport reports are viewable by everyone" 
ON public.transport_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create transport reports" 
ON public.transport_reports 
FOR INSERT 
WITH CHECK (true);

-- Create social resources table
CREATE TABLE public.social_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comedor', 'merendero', 'ong', 'centro_salud', 'educativo')),
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_phone TEXT,
  contact_email TEXT,
  schedule TEXT,
  needs TEXT[],
  verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_resources ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing
CREATE POLICY "Social resources are viewable by everyone" 
ON public.social_resources 
FOR SELECT 
USING (true);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('comercio', 'construccion', 'domestico', 'administrativo', 'gastronomia', 'educacion', 'salud', 'transporte', 'otros')),
  type TEXT DEFAULT 'formal' CHECK (type IN ('formal', 'informal')),
  salary_range TEXT,
  location TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  requirements TEXT,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing
CREATE POLICY "Jobs are viewable by everyone" 
ON public.jobs 
FOR SELECT 
USING (true);

-- Create security alerts table
CREATE TABLE public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('phishing', 'estafas', 'grooming', 'fraudes', 'malware', 'otros')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing
CREATE POLICY "Security alerts are viewable by everyone" 
ON public.security_alerts 
FOR SELECT 
USING (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_lines_updated_at
BEFORE UPDATE ON public.transport_lines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_reports_updated_at
BEFORE UPDATE ON public.transport_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_resources_updated_at
BEFORE UPDATE ON public.social_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_alerts_updated_at
BEFORE UPDATE ON public.security_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();