"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/db/supabase-server";

export type LoginState = {
  error: string;
};

export async function loginAdmin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { error: "Escribe el correo y la contraseña del administrador." };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase no está configurado." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Credenciales inválidas." };
  }

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAdmin() {
  const supabase = await getSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
