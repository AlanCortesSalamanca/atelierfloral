-- Atelier Floral Web - initial schema capture and hardening
-- Safe to run more than once in Supabase SQL Editor or via Supabase CLI.

BEGIN;

CREATE TABLE IF NOT EXISTS public.products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  category text NOT NULL,
  price numeric(10, 2),
  description text,
  stock integer,
  featured boolean NOT NULL DEFAULT false,
  image text,
  gallery_images text[],
  materials text[],
  fragrance text,
  dimensions text,
  handcrafted_details text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  items jsonb NOT NULL,
  unique_products integer NOT NULL DEFAULT 0,
  desired_total_pieces integer NOT NULL DEFAULT 0,
  estimated_subtotal numeric(10, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new',
  customer_instagram text,
  customer_email text,
  event_type text,
  event_date text,
  custom_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  anonymized_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_email text NOT NULL,
  admin_user_id uuid,
  action text NOT NULL,
  target_table text NOT NULL,
  target_id bigint,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ALTER COLUMN id SET GENERATED ALWAYS;
ALTER TABLE public.quote_requests ALTER COLUMN id SET GENERATED ALWAYS;
ALTER TABLE public.admin_audit_log ALTER COLUMN id SET GENERATED ALWAYS;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products (slug);
CREATE INDEX IF NOT EXISTS products_active_created_idx ON public.products (active, created_at DESC);
CREATE INDEX IF NOT EXISTS products_active_featured_created_idx ON public.products (active, featured, created_at DESC);
CREATE INDEX IF NOT EXISTS products_active_slug_idx ON public.products (active, slug) WHERE active = true;
CREATE INDEX IF NOT EXISTS products_created_idx ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS quote_requests_status_created_idx ON public.quote_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS quote_requests_created_idx ON public.quote_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx ON public.admin_audit_log (created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS quote_requests_set_updated_at ON public.quote_requests;
CREATE TRIGGER quote_requests_set_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.anonymize_old_quote_requests(retention interval DEFAULT interval '12 months')
RETURNS integer AS $$
DECLARE
  affected_rows integer;
BEGIN
  UPDATE public.quote_requests
  SET
    customer_name = 'ANONYMIZED',
    customer_phone = '0000000000',
    customer_instagram = NULL,
    customer_email = NULL,
    event_type = NULL,
    event_date = NULL,
    custom_notes = NULL,
    anonymized_at = now()
  WHERE created_at < now() - retention
    AND anonymized_at IS NULL;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_status_check'
  ) THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_status_check CHECK (status IN ('new', 'cancelled'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_price_check') THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_price_check CHECK (price IS NULL OR price >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_stock_check') THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_stock_check CHECK (stock IS NULL OR stock >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_check') THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_category_check CHECK (category IN ('Velas', 'Suculentas', 'Recuerdos', 'Kits', 'Personalizados'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_subtotal_check') THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_subtotal_check CHECK (estimated_subtotal >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_pieces_check') THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_pieces_check CHECK (desired_total_pieces >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_unique_products_check') THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_unique_products_check CHECK (unique_products >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_phone_check') THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_phone_check CHECK (customer_phone ~ '^\\d{10,15}$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_items_check') THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_items_check CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) > 0);
  END IF;
END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'anon_select_active_products') THEN
    CREATE POLICY anon_select_active_products ON public.products
      FOR SELECT TO anon
      USING (active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_audit_log' AND policyname = 'service_all_admin_audit_log') THEN
    CREATE POLICY service_all_admin_audit_log ON public.admin_audit_log
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'service_all_product_images') THEN
    CREATE POLICY service_all_product_images ON storage.objects
      FOR ALL TO service_role
      USING (bucket_id = 'product-images')
      WITH CHECK (bucket_id = 'product-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'product_images_public_read') THEN
    CREATE POLICY product_images_public_read ON storage.objects
      FOR SELECT TO anon, authenticated
      USING (bucket_id = 'product-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'service_all_products') THEN
    CREATE POLICY service_all_products ON public.products
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quote_requests' AND policyname = 'anon_insert_quote_requests') THEN
    ALTER POLICY anon_insert_quote_requests ON public.quote_requests
      WITH CHECK (
        status = 'new'
        AND customer_name IS NOT NULL
        AND customer_phone IS NOT NULL
        AND items IS NOT NULL
        AND jsonb_typeof(items) = 'array'
        AND jsonb_array_length(items) > 0
        AND customer_phone ~ '^\d{10,15}$'
      );
  ELSE
    CREATE POLICY anon_insert_quote_requests ON public.quote_requests
      FOR INSERT TO anon
      WITH CHECK (
        status = 'new'
        AND customer_name IS NOT NULL
        AND customer_phone IS NOT NULL
        AND items IS NOT NULL
        AND jsonb_typeof(items) = 'array'
        AND jsonb_array_length(items) > 0
        AND customer_phone ~ '^\d{10,15}$'
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quote_requests' AND policyname = 'service_all_quote_requests') THEN
    CREATE POLICY service_all_quote_requests ON public.quote_requests
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

COMMIT;
