-- Database API optimizations for product filtering and quote date integrity.
-- Safe to run more than once in Supabase SQL Editor or via Supabase CLI.

BEGIN;

CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);

CREATE OR REPLACE FUNCTION pg_temp.is_valid_iso_date(value text)
RETURNS boolean AS $$
DECLARE
  clean_value text := btrim(value);
  event_year integer;
  event_month integer;
  event_day integer;
  last_day_of_month integer;
BEGIN
  IF clean_value !~ '^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$' THEN
    RETURN false;
  END IF;

  event_year := substring(clean_value from 1 for 4)::integer;
  event_month := substring(clean_value from 6 for 2)::integer;
  event_day := substring(clean_value from 9 for 2)::integer;

  IF event_year < 1 OR event_year > 9999 THEN
    RETURN false;
  END IF;

  last_day_of_month := extract(day from (make_date(event_year, event_month, 1) + interval '1 month' - interval '1 day'))::integer;
  RETURN event_day <= last_day_of_month;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

DO $$
DECLARE
  current_event_date_type text;
  invalid_event_date_rows bigint;
BEGIN
  SELECT data_type
    INTO current_event_date_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'quote_requests'
    AND column_name = 'event_date';

  IF current_event_date_type IS NOT NULL AND current_event_date_type <> 'date' THEN
    EXECUTE $sql$
      SELECT count(*)
      FROM public.quote_requests
      WHERE event_date IS NOT NULL
        AND btrim(event_date::text) <> ''
        AND NOT pg_temp.is_valid_iso_date(event_date::text)
    $sql$ INTO invalid_event_date_rows;

    IF invalid_event_date_rows > 0 THEN
      RAISE WARNING 'Migration will set event_date to NULL for % quote_requests row(s) with invalid legacy dates', invalid_event_date_rows;
    END IF;

    EXECUTE $sql$
      ALTER TABLE public.quote_requests
        ALTER COLUMN event_date TYPE date
        USING CASE
          WHEN event_date IS NULL OR btrim(event_date::text) = '' THEN NULL
          WHEN pg_temp.is_valid_iso_date(event_date::text) THEN btrim(event_date::text)::date
          ELSE NULL
        END
    $sql$;
  END IF;
END $$;

COMMIT;
