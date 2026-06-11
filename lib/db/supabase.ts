import { createClient } from "@supabase/supabase-js";
import { hasSupabaseConfig, siteConfig } from "@/lib/config";

export function getSupabaseClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  return createClient(siteConfig.supabaseUrl, siteConfig.supabaseAnonKey);
}
