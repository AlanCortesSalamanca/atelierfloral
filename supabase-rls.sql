-- ============================================
-- Atelier Floral Web - RLS Policies
-- Pega todo esto en Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Habilitar RLS en ambas tablas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- 2. Policy: anon puede SELECT productos activos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'anon_select_active_products') THEN
    CREATE POLICY anon_select_active_products ON public.products
      FOR SELECT TO anon
      USING (active = true);
  END IF;
END $$;

-- 3. Policy: service_role tiene acceso total a products
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'service_all_products') THEN
    CREATE POLICY service_all_products ON public.products
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 4. Policy: anon puede INSERT en quote_requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quote_requests' AND policyname = 'anon_insert_quote_requests') THEN
    CREATE POLICY anon_insert_quote_requests ON public.quote_requests
      FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- 5. Policy: service_role tiene acceso total a quote_requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quote_requests' AND policyname = 'service_all_quote_requests') THEN
    CREATE POLICY service_all_quote_requests ON public.quote_requests
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
