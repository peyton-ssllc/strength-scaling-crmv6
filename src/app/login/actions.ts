"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loginWithEmail(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/queue");

  if (!email || !password) {
    redirect(`/login?error=missing&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=invalid&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function sendPasswordRecovery(formData: FormData) {
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    redirect("/login?error=missing-email");
  }

  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  const origin = headerStore.get("origin") || (host ? `${protocol}://${host}` : "");
  const supabase = await createSupabaseServerClient();
  const options = origin ? { redirectTo: `${origin}/auth/confirm?next=/reset-password` } : undefined;

  await supabase.auth.resetPasswordForEmail(email, options);

  redirect("/login?reset=sent");
}
