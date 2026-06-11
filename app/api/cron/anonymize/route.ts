import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase no está configurado" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const { data, error } = await supabase.rpc("anonymize_old_quote_requests");
  if (error) {
    console.error("[cron/anonymize] Supabase error:", error.message);
    return NextResponse.json({ error: "No se pudo ejecutar la anonimización" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json({ ok: true, affectedRows: data ?? 0 }, { headers: { "Cache-Control": "no-store" } });
}
