-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inovafood-images', 'inovafood-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inovafood-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their images  
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'inovafood-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'inovafood-images'
  AND auth.role() = 'authenticated'
);

-- Allow public to view images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'inovafood-images');

-- Create whatsapp_connections table for WhatsApp integration
CREATE TABLE IF NOT EXISTS public.whatsapp_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'disconnected',
  qr_code TEXT,
  session_data JSONB,
  connected_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

-- Policies for whatsapp_connections
CREATE POLICY "Tenant members can view their connections"
ON public.whatsapp_connections FOR SELECT
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Tenant members can insert their connections"
ON public.whatsapp_connections FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Tenant members can update their connections"
ON public.whatsapp_connections FOR UPDATE
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Tenant members can delete their connections"
ON public.whatsapp_connections FOR DELETE
USING (tenant_id = get_user_tenant_id());