"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/app/admin/actions/auth";

export function LoginForm({ next = "/admin" }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(loginAdmin, { error: "" });

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
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
        className="w-full rounded-full bg-ink px-6 py-3 font-semibold text-cream shadow-card transition hover:bg-coffee disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar al administrador"}
      </button>
    </form>
  );
}
