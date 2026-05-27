import { createSupabaseAdminClient } from "@/lib/admin";

export type ContactLead = {
  id: string;
  business: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  status: string;
  score: number;
  source: string;
};

function readableStatus(status: string | null | undefined) {
  if (!status) return "New";

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

  return map[status] || status;
}

export async function getContacts(): Promise<ContactLead[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, business_name, contact_name, owner_name, phone, email, city, state, status, score, lead_source"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load contacts", error);
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
    status: readableStatus(lead.status),
    score: lead.score ?? 0,
    source: lead.lead_source || "",
  }));
}
