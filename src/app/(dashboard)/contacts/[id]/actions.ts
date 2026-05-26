"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { normalizeStatus, todayIso } from "@/lib/format";

export async function logContactOutcome(formData: FormData) {
  const leadId = String(formData.get("leadId") || "");
  const outcome = String(formData.get("outcome") || "Called");
  const note = String(formData.get("note") || "");

  if (!leadId) throw new Error("Missing lead id");

  const supabase = createSupabaseAdminClient();

  const { error: activityError } = await supabase.from("activities").insert({
    lead_id: leadId,
    type: "call",
    outcome,
    note
  });
  if (activityError) throw new Error(activityError.message);

  const { error: leadError } = await supabase
    .from("leads")
    .update({
      status: normalizeStatus(outcome),
      notes: note,
      last_contacted_at: todayIso()
    })
    .eq("id", leadId);
  if (leadError) throw new Error(leadError.message);

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${leadId}`);
  revalidatePath("/queue");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline-clients");
}
