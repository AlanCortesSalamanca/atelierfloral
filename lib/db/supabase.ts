import { createClient } from "@supabase/supabase-js";
import { hasSupabaseAdminConfig, hasSupabaseConfig, siteConfig } from "@/lib/config";

export function getSupabaseClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  return createClient(siteConfig.supabaseUrl, siteConfig.supabaseAnonKey);
}

export function getSupabaseBrowserClient() {
  return getSupabaseClient();
}

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
