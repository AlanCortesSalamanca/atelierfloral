"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedAdminClient } from "@/app/admin/actions/admin-client";

export async function cancelQuote(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await getAuthenticatedAdminClient();

  const { error } = await supabase.from("quote_requests").update({ status: "cancelled" }).eq("id", id);
  if (error) {
    console.error("[cancelQuote] Supabase error:", error.message);
    throw new Error("No se pudo cancelar la cotización. Intenta de nuevo.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/cotizaciones");
}
