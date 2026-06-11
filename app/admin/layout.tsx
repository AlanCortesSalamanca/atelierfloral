import { AdminSidebar } from "@/app/admin/components/AdminSidebar";
import { SessionMonitor } from "@/app/admin/components/SessionMonitor";
import { isAllowedAdminUser } from "@/lib/admin/access";
import { getAdminCsrfToken } from "@/lib/admin/csrf-server";
import { getSupabaseServerClient } from "@/lib/db/supabase-server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!isAllowedAdminUser(user)) {
    redirect("/admin/login");
  }

  const csrfToken = await getAdminCsrfToken();

  return (
    <main className="container-page section-pad">
      <SessionMonitor />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <AdminSidebar csrfToken={csrfToken} />
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
