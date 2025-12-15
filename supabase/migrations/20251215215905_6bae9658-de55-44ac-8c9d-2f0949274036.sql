-- Create partnerships table for managing delivery platform integrations
CREATE TABLE IF NOT EXISTS public.partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  external_link TEXT,
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view published partnerships"
ON public.partnerships FOR SELECT
USING (published = true);

CREATE POLICY "Tenant members can view all partnerships"
ON public.partnerships FOR SELECT
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Tenant members can insert partnerships"
ON public.partnerships FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Tenant members can update partnerships"
ON public.partnerships FOR UPDATE
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Tenant members can delete partnerships"
ON public.partnerships FOR DELETE
USING (tenant_id = get_user_tenant_id());