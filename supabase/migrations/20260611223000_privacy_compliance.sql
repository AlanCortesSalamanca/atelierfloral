-- Privacy compliance additions for quote consent tracking.

BEGIN;

ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS privacy_accepted boolean;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quote_requests_privacy_accepted_check'
  ) THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_privacy_accepted_check CHECK (privacy_accepted IS NULL OR privacy_accepted = true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quote_requests' AND policyname = 'anon_insert_quote_requests') THEN
    ALTER POLICY anon_insert_quote_requests ON public.quote_requests
      WITH CHECK (
        status = 'new'
        AND privacy_accepted = true
        AND customer_name IS NOT NULL
        AND customer_phone IS NOT NULL
        AND items IS NOT NULL
        AND jsonb_typeof(items) = 'array'
        AND jsonb_array_length(items) > 0
        AND customer_phone ~ '^\d{10,15}$'
      );
  END IF;
END $$;

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
    privacy_accepted = NULL,
    anonymized_at = now()
  WHERE created_at < now() - retention
    AND anonymized_at IS NULL;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

REVOKE EXECUTE ON FUNCTION public.anonymize_old_quote_requests(interval) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.anonymize_old_quote_requests(interval) FROM anon;
REVOKE EXECUTE ON FUNCTION public.anonymize_old_quote_requests(interval) FROM authenticated;

COMMIT;
