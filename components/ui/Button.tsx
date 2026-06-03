import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "bg-ink text-cream shadow-card hover:bg-coffee"
      : "border border-gold/70 bg-cream text-ink hover:bg-beige/70";

  return <button className={`rounded-full px-6 py-3 font-semibold transition ${variantClass} ${className}`} {...props} />;
}
