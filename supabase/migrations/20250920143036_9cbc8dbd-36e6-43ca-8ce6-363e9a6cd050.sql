-- Add admin role support and policies for admin operations

-- Add admin policies for all tables
-- Jobs policies for admin
CREATE POLICY "Admins can manage jobs" 
ON public.jobs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Security alerts policies for admin  
CREATE POLICY "Admins can manage security alerts" 
ON public.security_alerts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Social resources policies for admin
CREATE POLICY "Admins can manage social resources" 
ON public.social_resources 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Transport lines policies for admin
CREATE POLICY "Admins can manage transport lines" 
ON public.transport_lines 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Transport stops policies for admin
CREATE POLICY "Admins can manage transport stops" 
ON public.transport_stops 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Transport reports policies for admin
CREATE POLICY "Admins can manage transport reports" 
ON public.transport_reports 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete transport reports" 
ON public.transport_reports 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Add triggers for updated_at columns where missing
CREATE TRIGGER set_timestamp_jobs
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_timestamp_security_alerts
  BEFORE UPDATE ON public.security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_timestamp_social_resources
  BEFORE UPDATE ON public.social_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_timestamp_transport_lines
  BEFORE UPDATE ON public.transport_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();