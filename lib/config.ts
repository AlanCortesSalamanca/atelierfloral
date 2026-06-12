const rawAllowedOrigins = process.env.ALLOWED_ORIGINS;

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const siteConfig = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://atelierfloral.mx").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "",
  productImagesBucket: process.env.NEXT_PUBLIC_PRODUCT_IMAGES_BUCKET ?? "product-images",
  allowedOrigins: (rawAllowedOrigins?.trim() ? rawAllowedOrigins : "http://localhost:3000").split(",").map((o) => o.trim()).filter(Boolean),
};

export function hasSupabaseConfig() {
  return Boolean(siteConfig.supabaseAnonKey && isValidHttpUrl(siteConfig.supabaseUrl));
}

export function hasSupabaseAdminConfig() {
  return Boolean(siteConfig.supabaseServiceRoleKey && isValidHttpUrl(siteConfig.supabaseUrl));
}
