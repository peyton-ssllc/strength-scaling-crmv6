export { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/admin";
import { createSupabaseServerClient as createServerAuthClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "sdr";

export type CurrentProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  is_active: boolean;
};

export async function getCurrentUser() {
  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return user;

  // Vercel/Next internal navigation can occasionally reach a Server Component before
  // middleware has refreshed the cookie. This fallback prevents a false logout.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ?? null;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const user = await getCurrentUser();

  if (!user?.id) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const fallbackEmail = user.email ?? "";

    const { data: created } = await admin
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: fallbackEmail,
          full_name: user.user_metadata?.full_name ?? fallbackEmail,
          role: "sdr",
          is_active: true,
        },
        { onConflict: "id" }
      )
      .select("id, email, full_name, role, is_active")
      .single();

    if (!created) return null;

    return {
      id: created.id,
      email: created.email ?? fallbackEmail,
      full_name: created.full_name,
      role: created.role === "admin" ? "admin" : "sdr",
      is_active: created.is_active !== false,
    };
  }

  return {
    id: profile.id,
    email: profile.email ?? user.email ?? "",
    full_name: profile.full_name,
    role: profile.role === "admin" ? "admin" : "sdr",
    is_active: profile.is_active !== false,
  };
}

export async function requireCurrentProfile() {
  const profile = await getCurrentProfile();

  if (!profile || !profile.is_active) {
    redirect("/login");
  }

  return profile;
}

export async function requireAdminProfile() {
  const profile = await requireCurrentProfile();

  if (profile.role !== "admin") {
    redirect("/queue");
  }

  return profile;
}
