export const siteConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "",
};

export function hasSupabaseConfig() {
  return Boolean(siteConfig.supabaseUrl && siteConfig.supabaseAnonKey);
}
