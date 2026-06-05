import { LoginForm } from "@/app/admin/login/LoginForm";
import { getSupabaseServerClient } from "@/lib/db/supabase-server";
import { redirect } from "next/navigation";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (user) {
    redirect("/admin");
  }

  return (
    <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <section className="w-full max-w-md rounded-[2.5rem] border border-white/70 bg-white/70 p-8 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Administrador</p>
        <h1 className="mt-3 font-heading text-4xl text-ink">Acceso privado</h1>
        <p className="mt-3 leading-7 text-coffee">Usa el usuario administrador creado en Supabase para gestionar cotizaciones y productos.</p>
        <LoginForm next={next} />
      </section>
    </main>
  );
}
