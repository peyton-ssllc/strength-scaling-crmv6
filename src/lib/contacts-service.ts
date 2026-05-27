import { requireCurrentProfile } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/admin";
import { applyLeadVisibility } from "@/lib/permissions";

export type ContactLead = {
  id: string;
  business: string;
  contact: string;
  ownerEmail: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  status: string;
  score: number;
  source: string;
};

function readableStatus(status: string | null | undefined) {
  const map: Record<string, string> = {
    new: "New",
    queued: "New",
    working: "Working",
    contacted: "Called",
    follow_up_scheduled: "Follow Up",
    meeting_booked: "Booked",
    qualified: "Interested",
    unqualified: "Unqualified",
    bad_data: "Bad Data",
    do_not_contact: "DNC",
    converted: "Booked",
    lost: "Lost",
  };

  return status ? map[status] || status : "New";
}

export async function getContacts(): Promise<ContactLead[]> {
  const profile = await requireCurrentProfile();
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("leads")
    .select("id, business_name, contact_name, owner_name, phone, email, city, state, status, score, lead_source, assigned_to")
    .order("created_at", { ascending: false });

  query = applyLeadVisibility(query, profile);

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load contacts", error);
    return [];
  }

  const ownerIds = Array.from(new Set((data ?? []).map((lead) => lead.assigned_to).filter(Boolean)));
  const ownerMap = new Map<string, string>();

  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", ownerIds);

    for (const owner of owners ?? []) {
      ownerMap.set(owner.id, owner.full_name || owner.email || "Assigned");
    }
  }

  return (data ?? []).map((lead) => ({
    id: lead.id,
    business: lead.business_name || "Unnamed Business",
    contact: lead.contact_name || lead.owner_name || "",
    ownerEmail: lead.assigned_to ? ownerMap.get(lead.assigned_to) || "Assigned" : "Unassigned",
    phone: lead.phone || "",
    email: lead.email || "",
    city: lead.city || "",
    state: lead.state || "",
    status: readableStatus(lead.status),
    score: lead.score ?? 0,
    source: lead.lead_source || "",
  }));
}
