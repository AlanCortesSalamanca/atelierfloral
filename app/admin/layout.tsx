import { AdminSidebar } from "@/app/admin/components/AdminSidebar";
import { getSupabaseServerClient } from "@/lib/db/supabase-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <main className="container-page section-pad">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <AdminSidebar />
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
