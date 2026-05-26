"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { statusToDb } from "@/lib/format";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function number(formData: FormData, key: string, fallback = 50) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : fallback;
}

export async function createContact(formData: FormData) {
  const businessName = text(formData, "businessName");
  if (!businessName) throw new Error("Business name is required");

  const potentialRevenue = text(formData, "potentialRevenue");
  const rawNotes = text(formData, "notes");
  const finalNotes = potentialRevenue ? `[potential_revenue:${potentialRevenue}] ${rawNotes}`.trim() : rawNotes;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      business_name: businessName,
      contact_name: text(formData, "contactName") || null,
      owner_name: text(formData, "ownerName") || null,
      phone: text(formData, "phone") || null,
      email: text(formData, "email") || null,
      website: text(formData, "website") || null,
      city: text(formData, "city") || null,
      state: text(formData, "state") || null,
      lead_source: text(formData, "source") || "Manual Entry",
      status: statusToDb(text(formData, "status") || "New"),
      score: number(formData, "score"),
      notes: finalNotes || null,
      notes_summary: finalNotes || null
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/contacts");
  revalidatePath("/queue");
  revalidatePath("/pipeline-clients");
  redirect(`/contacts/${data.id}`);
}

export async function deleteContact(formData: FormData) {
  const leadId = text(formData, "leadId");
  if (!leadId) throw new Error("Missing lead id");
  const supabase = createSupabaseAdminClient();

  await supabase.from("activities").delete().eq("lead_id", leadId);
  await supabase.from("tasks").delete().eq("lead_id", leadId);
  await supabase.from("opportunities").delete().eq("lead_id", leadId);
  await supabase.from("meetings").delete().eq("lead_id", leadId);
  await supabase.from("queue_locks").delete().eq("lead_id", leadId);
  await supabase.from("review_flags").delete().eq("lead_id", leadId);

  const { error } = await supabase.from("leads").delete().eq("id", leadId);
  if (error) throw new Error(error.message);

  revalidatePath("/contacts");
  revalidatePath("/queue");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline-clients");
  redirect("/contacts");
}
