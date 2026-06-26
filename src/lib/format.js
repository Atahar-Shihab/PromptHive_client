export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function formatDate(value) {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function rating(value = 0) {
  return Number(value).toFixed(1);
}
