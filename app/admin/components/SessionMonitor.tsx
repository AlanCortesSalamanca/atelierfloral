"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const sessionCheckIntervalMs = 10 * 60 * 1000;
const redirectDelayMs = 3000;

export function SessionMonitor() {
  const [expired, setExpired] = useState(false);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let active = true;

    function clearRedirectTimer() {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    }

    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session-status", { cache: "no-store" });
        if (!active) return;

        if (response.ok) {
          clearRedirectTimer();
          setExpired(false);
          return;
        }

        if (response.status === 401) {
          setExpired(true);
          if (redirectTimerRef.current) return;

          redirectTimerRef.current = setTimeout(() => {
            const next = encodeURIComponent(pathnameRef.current || "/admin");
            router.replace(`/admin/login?next=${next}&reason=session-expired`);
          }, redirectDelayMs);
        }
      } catch {
        // Ignore transient local/dev network errors; the next poll or submit will validate the session.
      }
    }

    checkSession();
    const interval = setInterval(checkSession, sessionCheckIntervalMs);

    return () => {
      active = false;
      clearInterval(interval);
      clearRedirectTimer();
    };
  }, [router]);

  if (!expired) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="session-expired-title">
      <div className="max-w-md rounded-[2rem] border border-white/70 bg-cream p-7 text-center shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-sage">Sesión terminada</p>
        <h2 id="session-expired-title" className="mt-3 font-heading text-3xl text-ink">
          Tu tiempo como administrador terminó
        </h2>
        <p className="mt-4 leading-7 text-coffee">Por seguridad, te redirigiremos al inicio de sesión para que vuelvas a entrar.</p>
      </div>
    </div>
  );
}
