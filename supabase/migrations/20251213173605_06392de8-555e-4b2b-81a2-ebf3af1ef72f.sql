
-- Create custom types
CREATE TYPE public.user_role AS ENUM ('OWNER', 'STAFF');
CREATE TYPE public.order_channel AS ENUM ('WEB', 'MANUAL');
CREATE TYPE public.order_status AS ENUM ('PENDING', 'PREPARING', 'DONE', 'CANCELED');
CREATE TYPE public.tenant_plan AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- Tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan tenant_plan DEFAULT 'FREE',
  is_active BOOLEAN DEFAULT true,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role DEFAULT 'STAFF',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Banners table
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  link TEXT,
  published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  channel order_channel DEFAULT 'WEB',
  status order_status DEFAULT 'PENDING',
  subtotal DECIMAL(10,2) DEFAULT 0,
  delivery DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  qty INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0
);

-- Settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_open BOOLEAN DEFAULT true,
  opening_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "22:00"}, "tuesday": {"open": "09:00", "close": "22:00"}, "wednesday": {"open": "09:00", "close": "22:00"}, "thursday": {"open": "09:00", "close": "22:00"}, "friday": {"open": "09:00", "close": "23:00"}, "saturday": {"open": "10:00", "close": "23:00"}, "sunday": {"open": "10:00", "close": "20:00"}}'::jsonb,
  delivery_fee DECIMAL(10,2) DEFAULT 5.00,
  pickup_enabled BOOLEAN DEFAULT true,
  theme_primary TEXT DEFAULT '#6D28D9',
  theme_secondary TEXT DEFAULT '#F97316',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order status history
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status order_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

-- RLS Policies for tenants
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (id = public.get_user_tenant_id());

CREATE POLICY "Public can view active tenants by slug" ON public.tenants
  FOR SELECT USING (is_active = true);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- RLS Policies for categories (tenant members can CRUD, public can read published)
CREATE POLICY "Tenant members can view categories" ON public.categories
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Public can view published categories" ON public.categories
  FOR SELECT USING (published = true);

CREATE POLICY "Tenant members can insert categories" ON public.categories
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant members can update categories" ON public.categories
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant members can delete categories" ON public.categories
  FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for products
CREATE POLICY "Tenant members can view all products" ON public.products
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Public can view active published products" ON public.products
  FOR SELECT USING (active = true AND published_at IS NOT NULL AND published_at <= now());

CREATE POLICY "Tenant members can insert products" ON public.products
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant members can update products" ON public.products
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant members can delete products" ON public.products
  FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for banners
CREATE POLICY "Tenant members can view all banners" ON public.banners
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Public can view published banners" ON public.banners
  FOR SELECT USING (published = true);

CREATE POLICY "Tenant members can insert banners" ON public.banners
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant members can update banners" ON public.banners
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant members can delete banners" ON public.banners
  FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for customers
CREATE POLICY "Tenant members can view customers" ON public.customers
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant members can insert customers" ON public.customers
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant members can update customers" ON public.customers
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Anyone can create customer for order" ON public.customers
  FOR INSERT WITH CHECK (true);

-- RLS Policies for orders
CREATE POLICY "Tenant members can view orders" ON public.orders
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Anyone can create order" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Tenant members can update orders" ON public.orders
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Public can view own orders by code" ON public.orders
  FOR SELECT USING (true);

-- RLS Policies for order_items
CREATE POLICY "Tenant members can view order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.tenant_id = public.get_user_tenant_id())
  );

CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view order items" ON public.order_items
  FOR SELECT USING (true);

-- RLS Policies for settings
CREATE POLICY "Tenant members can view settings" ON public.settings
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Public can view settings" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Tenant members can update settings" ON public.settings
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant members can insert settings" ON public.settings
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

-- RLS Policies for order status history
CREATE POLICY "Tenant members can view status history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.tenant_id = public.get_user_tenant_id())
  );

CREATE POLICY "Tenant members can insert status history" ON public.order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.tenant_id = public.get_user_tenant_id())
  );

CREATE POLICY "Public can view status history" ON public.order_status_history
  FOR SELECT USING (true);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, tenant_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'STAFF'),
    (new.raw_user_meta_data ->> 'tenant_id')::uuid
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate order code
CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := 'IF' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  RETURN new_code;
END;
$$;

-- Trigger to auto-generate order code
CREATE OR REPLACE FUNCTION public.set_order_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := public.generate_order_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_order_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_order_code();

-- Trigger to add status history on order status change
CREATE OR REPLACE FUNCTION public.track_order_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status)
    VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_status_change
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.track_order_status();

-- Create indexes
CREATE INDEX idx_products_tenant ON public.products(tenant_id);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_categories_tenant ON public.categories(tenant_id);
CREATE INDEX idx_orders_tenant ON public.orders(tenant_id);
CREATE INDEX idx_orders_code ON public.orders(code);
CREATE INDEX idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX idx_banners_tenant ON public.banners(tenant_id);
