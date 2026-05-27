import type { CurrentProfile } from "@/lib/auth/server";

export function isAdmin(profile: CurrentProfile | null | undefined) {
  return profile?.role === "admin";
}

export function applyLeadVisibility<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  profile: CurrentProfile
) {
  if (isAdmin(profile)) return query;
  return query.eq("assigned_to", profile.id);
}
