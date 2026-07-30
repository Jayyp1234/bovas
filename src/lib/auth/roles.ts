import type { AppRole } from "@/lib/supabase/database.types";

const HOME_BY_ROLE: Record<AppRole, string> = {
  logistics: "/dashboard",
  admin: "/admin/dashboard",
  dispatch: "/dispatch/dashboard",
  safety: "/safety/tickets",
};

export function homePathForRole(role: AppRole | null | undefined): string {
  if (!role) return "/dashboard";
  return HOME_BY_ROLE[role];
}

export function displayLabelForRole(role: AppRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "dispatch":
      return "Dispatch";
    case "safety":
      return "Safety";
    default:
      return "Logistics";
  }
}
