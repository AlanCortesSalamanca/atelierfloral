"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/app/admin/actions/auth";
import { adminCsrfFieldName } from "@/lib/admin/csrf";

export function LoginForm({ next = "/admin", csrfToken }: { next?: string; csrfToken: string }) {
  const [state, formAction, isPending] = useActionState(loginAdmin, { error: "" });

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name={adminCsrfFieldName} value={csrfToken} />
      <label className="block text-sm font-semibold text-ink">
        Correo
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-full border border-beige bg-cream/70 px-4 py-3 outline-none focus:border-gold"
          autoComplete="email"
        />
      </label>
      <label className="block text-sm font-semibold text-ink">
        Contraseña
        <input
          name="password"
          type="password"
          required
          className="mt-2 w-full rounded-full border border-beige bg-cream/70 px-4 py-3 outline-none focus:border-gold"
          autoComplete="current-password"
        />
      </label>
      {state.error ? (
        <p role="alert" className="rounded-2xl bg-blush/20 p-3 text-sm font-semibold text-ink">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="tap-motion button-lift focus-gold w-full rounded-full bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-coffee hover:shadow-soft disabled:cursor-not-allowed disabled:animate-pulse disabled:hover:bg-ink disabled:hover:shadow-card"
      >
        {isPending ? "Entrando..." : "Entrar al administrador"}
      </button>
    </form>
  );
}
