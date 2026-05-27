"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function createFirstAdmin(formData: FormData) {
  const fullName = text(formData, "fullName") || "Admin";
  const email = text(formData, "email");
  const password = text(formData, "password");

  if (!email || !password) throw new Error("Email and password are required");

  const supabase = createSupabaseAdminClient();
  const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true });
  if ((count || 0) > 0) redirect("/login");

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "admin" }
  });
  if (error) throw new Error(error.message);

  const userId = data.user?.id;
  if (!userId) throw new Error("Admin user was not created");

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    email,
    role: "admin",
    is_active: true
  });
  if (profileError) throw new Error(profileError.message);

  redirect("/login");
}
