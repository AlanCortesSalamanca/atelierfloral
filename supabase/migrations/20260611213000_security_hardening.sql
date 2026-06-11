-- Security hardening for admin audit logging and SECURITY DEFINER functions.

BEGIN;

REVOKE EXECUTE ON FUNCTION public.anonymize_old_quote_requests(interval) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.anonymize_old_quote_requests(interval) FROM anon;
REVOKE EXECUTE ON FUNCTION public.anonymize_old_quote_requests(interval) FROM authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'quote_requests'
      AND policyname = 'authenticated_no_access_quote_requests'
  ) THEN
    CREATE POLICY authenticated_no_access_quote_requests ON public.quote_requests
      FOR ALL TO authenticated
      USING (false)
      WITH CHECK (false);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_audit_log'
      AND policyname = 'authenticated_insert_admin_auth_events'
  ) THEN
    CREATE POLICY authenticated_insert_admin_auth_events ON public.admin_audit_log
      FOR INSERT TO authenticated
      WITH CHECK (
        target_table = 'auth'
        AND target_id IS NULL
        AND admin_user_id = auth.uid()
        AND action IN ('admin.login_success', 'admin.login_rejected', 'admin.logout')
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS admin_audit_log_action_created_idx
  ON public.admin_audit_log (action, created_at DESC);

COMMIT;
