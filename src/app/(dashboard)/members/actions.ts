"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/admin";
import { requireAdminProfile } from "@/lib/auth/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function roleFromForm(formData: FormData) {
  return text(formData, "role") === "admin" ? "admin" : "sdr";
}

function cleanEmail(value: string) {
  return value.trim().toLowerCase();
}

async function findExistingAuthUserId(email: string) {
  const supabase = createSupabaseAdminClient();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw new Error(error.message);

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (match) return match.id;
    if (data.users.length < 1000) break;
  }

  return null;
}

export async function createMember(formData: FormData) {
  await requireAdminProfile();

  const fullName = text(formData, "fullName");
  const email = cleanEmail(text(formData, "email"));
  const password = text(formData, "password");
  const role = roleFromForm(formData);

  if (!email) throw new Error("Email is required.");

  const supabase = createSupabaseAdminClient();
  let userId = await findExistingAuthUserId(email);

  if (!userId) {
    if (!password || password.length < 8) {
      throw new Error("Temporary password must be at least 8 characters.");
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || email,
        role,
      },
    });

    if (error) throw new Error(error.message);
    userId = data.user?.id || null;
  } else if (password) {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password,
      user_metadata: {
        full_name: fullName || email,
        role,
      },
    });

    if (error) throw new Error(error.message);
  }

  if (!userId) throw new Error("User could not be created.");

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName || email,
      email,
      role,
      is_active: true,
    },
    { onConflict: "id" },
  );

  if (profileError) throw new Error(profileError.message);

  revalidatePath("/members");
  redirect("/members");
}

export const createRepLogin = createMember;

export async function updateMemberRole(formData: FormData) {
  await requireAdminProfile();

  const id = text(formData, "id");
  const role = roleFromForm(formData);

  if (!id) throw new Error("Member id is required.");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/members");
  redirect("/members");
}

export async function deactivateMember(formData: FormData) {
  const currentAdmin = await requireAdminProfile();
  const id = text(formData, "id");

  if (!id) throw new Error("Member id is required.");
  if (id === currentAdmin.id) {
    throw new Error("You cannot remove your own admin login.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/members");
  redirect("/members");
}

export async function reactivateMember(formData: FormData) {
  await requireAdminProfile();

  const id = text(formData, "id");
  if (!id) throw new Error("Member id is required.");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: true })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/members");
  redirect("/members");
}
