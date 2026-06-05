"use server";

import { getSupabaseAdminClient } from "@/lib/db/supabase";
import { getSupabaseServerClient } from "@/lib/db/supabase-server";

export async function getAuthenticatedAdminClient() {
  const sessionClient = await getSupabaseServerClient();
  if (!sessionClient) {
    throw new Error("Supabase no está configurado.");
  }

  const {
    data: { user },
    error,
  } = await sessionClient.auth.getUser();

  if (error || !user) {
    throw new Error("No hay sesión de administrador activa.");
  }

  const adminClient = getSupabaseAdminClient();
  if (!adminClient) {
    throw new Error("Error de configuración del servidor. Contacta al administrador.");
  }

  return adminClient;
}
