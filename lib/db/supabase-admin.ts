import "server-only";

import { createClient } from "@supabase/supabase-js";
import { hasSupabaseAdminConfig, siteConfig } from "@/lib/config";

export function getSupabaseAdminClient() {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  return createClient(siteConfig.supabaseUrl, siteConfig.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
