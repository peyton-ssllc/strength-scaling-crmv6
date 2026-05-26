"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function createRepLogin(formData: FormData) {
  const fullName = text(formData, "fullName");
  const email = text(formData, "email");
  const password = text(formData, "password");
  const role = text(formData, "role") === "admin" ? "admin" : "sdr";

  if (!email || !password) throw new Error("Email and password are required");

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role }
  });
  if (error) throw new Error(error.message);

  const userId = data.user?.id;
  if (userId) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName || email,
      email,
      role,
      is_active: true
    });
    if (profileError) throw new Error(profileError.message);
  }

  revalidatePath("/members");
}
