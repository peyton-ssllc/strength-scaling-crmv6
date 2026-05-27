import { requireCurrentProfile } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/admin";
import { applyLeadVisibility } from "@/lib/permissions";

export type QueueLead = {
  id: string;
  business: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  status: string;
  score: number;
  notes: string;
};

export async function getQueueLeads(): Promise<QueueLead[]> {
  const profile = await requireCurrentProfile();
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("leads")
    .select("id, business_name, contact_name, owner_name, phone, email, city, state, status, score, notes_summary, notes")
    .not("status", "in", "(converted,lost,do_not_contact,bad_data)")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(50);

  query = applyLeadVisibility(query, profile);

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load queue", error);
    return [];
  }

  return (data ?? []).map((lead) => ({
    id: lead.id,
    business: lead.business_name || "Unnamed Business",
    contact: lead.contact_name || lead.owner_name || "",
    phone: lead.phone || "",
    email: lead.email || "",
    city: lead.city || "",
    state: lead.state || "",
    status: lead.status || "new",
    score: lead.score ?? 0,
    notes: lead.notes_summary || lead.notes || "",
  }));
}

export async function getNextQueueLead(): Promise<QueueLead | null> {
  const leads = await getQueueLeads();
  return leads[0] ?? null;
}
