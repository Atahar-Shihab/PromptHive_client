export function roleHomePath(role) {
  if (role === "admin") return "/admin";
  if (role === "creator") return "/creator";
  return "/dashboard";
}
