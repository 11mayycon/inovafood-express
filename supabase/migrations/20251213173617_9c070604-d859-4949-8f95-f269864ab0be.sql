
-- Fix function search_path for generate_order_code
CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := 'IF' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  RETURN new_code;
END;
$$;

-- Fix function search_path for set_order_code
CREATE OR REPLACE FUNCTION public.set_order_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := public.generate_order_code();
  END IF;
  RETURN NEW;
END;
$$;
