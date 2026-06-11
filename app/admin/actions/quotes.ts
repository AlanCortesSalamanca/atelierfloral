"use server";

import { revalidatePath } from "next/cache";
import { assertSameOriginAdminAction, getAuthenticatedAdminContext, logAdminAction } from "@/app/admin/actions/admin-client";

export async function cancelQuote(formData: FormData) {
  await assertSameOriginAdminAction(formData);

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { supabase, user } = await getAuthenticatedAdminContext();

  const { error } = await supabase.from("quote_requests").update({ status: "cancelled" }).eq("id", id);
  if (error) {
    console.error("[cancelQuote] Supabase error:", error.message);
    throw new Error("No se pudo cancelar la cotización. Intenta de nuevo.");
  }

  await logAdminAction(supabase, user, "quote.cancel", "quote_requests", Number(id));

  revalidatePath("/admin");
  revalidatePath("/admin/cotizaciones");
}
