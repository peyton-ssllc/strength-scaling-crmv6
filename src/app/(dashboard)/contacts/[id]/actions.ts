"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { normalizeStatus, todayIso } from "@/lib/format";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function logContactOutcome(formData: FormData) {
  const leadId = text(formData, "leadId");
  const outcome = text(formData, "outcome") || "Called";
  const note = text(formData, "note");

  if (!leadId) throw new Error("Missing lead id");

  const supabase = createSupabaseAdminClient();

  const { error: activityError } = await supabase.from("activities").insert({
    lead_id: leadId,
    type: "call",
    outcome,
    note
  });
  if (activityError) throw new Error(activityError.message);

  const update: Record<string, string> = {
    status: normalizeStatus(outcome),
    last_contacted_at: todayIso()
  };

  if (note) {
    update.notes = note;
    update.notes_summary = note;
  }

  const { error: leadError } = await supabase.from("leads").update(update).eq("id", leadId);
  if (leadError) throw new Error(leadError.message);

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${leadId}`);
  revalidatePath("/queue");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline-clients");
}

export async function addContactNote(formData: FormData) {
  const leadId = text(formData, "leadId");
  const note = text(formData, "note");

  if (!leadId) throw new Error("Missing lead id");
  if (!note) throw new Error("Write a note first");

  const supabase = createSupabaseAdminClient();

  const { error: activityError } = await supabase.from("activities").insert({
    lead_id: leadId,
    type: "note",
    outcome: "Note Added",
    note
  });
  if (activityError) throw new Error(activityError.message);

  const { error: leadError } = await supabase
    .from("leads")
    .update({ notes: note, notes_summary: note })
    .eq("id", leadId);
  if (leadError) throw new Error(leadError.message);

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${leadId}`);
}

export async function addContactToPipeline(formData: FormData) {
  const leadId = text(formData, "leadId");

  if (!leadId) throw new Error("Missing lead id");

  const supabase = createSupabaseAdminClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("pipeline_notes")
    .eq("id", leadId)
    .maybeSingle();

  const pipelineNotes = lead?.pipeline_notes || "Added to pipeline from contact record.";
  const { error: leadError } = await supabase
    .from("leads")
    .update({
      pipeline_status: "follow_up",
      pipeline_rank: "warm",
      pipeline_notes: pipelineNotes
    })
    .eq("id", leadId);

  if (leadError) throw new Error(leadError.message);

  await supabase.from("activities").insert({
    lead_id: leadId,
    type: "pipeline_stage_changed",
    outcome: "Added to Pipeline",
    note: "Added to Pipeline & Clients."
  });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${leadId}`);
  revalidatePath("/pipeline-clients");
}

export async function assignContactOwner(formData: FormData) {
  const leadId = text(formData, "leadId");
  const ownerId = text(formData, "ownerId");

  if (!leadId) throw new Error("Missing lead id");

  const supabase = createSupabaseAdminClient();

  const { data: owner } = ownerId
    ? await supabase.from("profiles").select("full_name,email").eq("id", ownerId).maybeSingle()
    : ({ data: null } as any);

  const { error: leadError } = await supabase
    .from("leads")
    .update({ assigned_to: ownerId || null })
    .eq("id", leadId);
  if (leadError) throw new Error(leadError.message);

  await supabase.from("activities").insert({
    lead_id: leadId,
    type: "status_change",
    outcome: "Owner Updated",
    note: ownerId ? `Assigned to ${owner?.full_name || owner?.email || "team member"}` : "Owner cleared"
  });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${leadId}`);
  revalidatePath("/queue");
}
