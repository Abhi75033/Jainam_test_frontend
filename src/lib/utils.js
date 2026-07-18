import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = "INR") {
  if (amount == null) return "—";
  const num = Number(amount);
  if (Number.isNaN(num)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2)}`;
  }
}

export function formatDate(iso, opts = { dateStyle: "medium" }) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", opts).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDateTime(iso) {
  return formatDate(iso, { dateStyle: "medium", timeStyle: "short" });
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function truncate(str = "", n = 40) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}
