"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { normalizeStatus, todayIso } from "@/lib/format";

export async function logLeadOutcome(formData: FormData) {
  const leadId = String(formData.get("leadId") || "");
  const outcome = String(formData.get("outcome") || "called");
  const note = String(formData.get("note") || "");
  const followUpAt = String(formData.get("followUpAt") || "");

  if (!leadId) throw new Error("Missing lead id");

  const status = normalizeStatus(outcome);
  const supabase = createSupabaseAdminClient();

  const { error: activityError } = await supabase.from("activities").insert({
    lead_id: leadId,
    type: "call",
    outcome,
    note
  });
  if (activityError) throw new Error(activityError.message);

  const update: Record<string, string> = {
    status,
    last_contacted_at: todayIso()
  };
  if (note) update.notes = note;
  if (followUpAt) update.next_follow_up_at = followUpAt;

  const { error: leadError } = await supabase.from("leads").update(update).eq("id", leadId);
  if (leadError) throw new Error(leadError.message);

  revalidatePath("/queue");
  revalidatePath("/contacts");
}
