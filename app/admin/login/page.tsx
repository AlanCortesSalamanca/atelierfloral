import { LoginForm } from "@/app/admin/login/LoginForm";
import { isAllowedAdminUser } from "@/lib/admin/access";
import { getAdminCsrfToken } from "@/lib/admin/csrf-server";
import { getSupabaseServerClient } from "@/lib/db/supabase-server";
import { redirect } from "next/navigation";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reason?: string }> }) {
  const { next, reason } = await searchParams;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (isAllowedAdminUser(user)) {
    redirect("/admin");
  }

  const csrfToken = await getAdminCsrfToken();

  return (
    <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <section className="w-full max-w-md rounded-[2.5rem] border border-white/70 bg-white/70 p-8 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Administrador</p>
        <h1 className="mt-3 font-heading text-4xl text-ink">Acceso privado</h1>
        <p className="mt-3 leading-7 text-coffee">Usa el usuario administrador.</p>
        {reason === "session-expired" ? (
          <p role="alert" className="mt-4 rounded-2xl bg-blush/20 p-3 text-sm font-semibold text-ink">
            Tu sesión expiró. Inicia sesión de nuevo para continuar.
          </p>
        ) : null}
        <LoginForm next={next} csrfToken={csrfToken} />
      </section>
    </main>
  );
}
