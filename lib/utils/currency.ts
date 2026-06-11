export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "$0.00";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}
