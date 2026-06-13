import { cache } from "react";
import { getSupabaseClient } from "@/lib/db/supabase";
import { PRODUCT_DETAIL_COLUMNS, PRODUCT_SUMMARY_COLUMNS } from "@/lib/db/product-columns";
import type { Product, ProductSummary } from "@/lib/types";

export const getActiveProducts = cache(async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return [] as ProductSummary[];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_COLUMNS)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error loading products", error.message);
    return [] as ProductSummary[];
  }

  return (data ?? []) as ProductSummary[];
});

export const getFeaturedProducts = cache(async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return [] as ProductSummary[];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SUMMARY_COLUMNS)
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Error loading featured products", error.message);
    return [] as ProductSummary[];
  }

  return (data ?? []) as ProductSummary[];
});

export const getProductBySlug = cache(async (slug: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("products").select(PRODUCT_DETAIL_COLUMNS).eq("active", true).eq("slug", slug).maybeSingle();

  if (error) {
    console.error("Error loading product", error.message);
    return null;
  }

  return data as Product;
});
