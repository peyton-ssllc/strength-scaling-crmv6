import { createSupabaseAdminClient } from "@/lib/supabase";
import { clean, readableStatus } from "@/lib/format";
import type { Lead } from "@/lib/types";

const columns = "id,business_name,contact_name,owner_name,phone,email,city,state,status,score,lead_source,notes,notes_summary,last_contacted_at,created_at,pipeline_status,pipeline_rank,monthly_retainer,estimated_monthly_profit,pipeline_notes";

type LeadRow = {
  id: string;
  business_name: string | null;
  contact_name: string | null;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
  score: number | null;
  lead_source: string | null;
  notes: string | null;
  notes_summary: string | null;
  last_contacted_at: string | null;
  created_at: string | null;
  pipeline_status: string | null;
  pipeline_rank: string | null;
  monthly_retainer: number | null;
  estimated_monthly_profit: number | null;
  pipeline_notes: string | null;
};

function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    business: clean(row.business_name) || "Unnamed Business",
    contact: clean(row.contact_name) || clean(row.owner_name),
    phone: clean(row.phone),
    email: clean(row.email),
    city: clean(row.city),
    state: clean(row.state),
    status: readableStatus(row.status),
    score: row.score ?? 50,
    source: clean(row.lead_source),
    notes: clean(row.notes) || clean(row.notes_summary),
    lastContacted: row.last_contacted_at ? new Date(row.last_contacted_at).toLocaleDateString() : "",
    createdAt: row.created_at || "",
    pipelineStatus: clean(row.pipeline_status) || "next_up",
    pipelineRank: clean(row.pipeline_rank) || "warm",
    monthlyRetainer: Number(row.monthly_retainer || 0),
    estimatedMonthlyProfit: Number(row.estimated_monthly_profit || row.monthly_retainer || 0),
    pipelineNotes: clean(row.pipeline_notes)
  };
}

export async function getLeads(limit = 250): Promise<Lead[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("leads").select(columns).order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return ((data || []) as LeadRow[]).map(toLead);
}

export async function getQueueLeads(): Promise<Lead[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select(columns)
    .in("status", ["new", "queued", "working", "contacted", "follow_up_scheduled", "qualified"])
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) throw new Error(error.message);
  return ((data || []) as LeadRow[]).map(toLead);
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("leads").select(columns).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return toLead(data as LeadRow);
}

export async function getLeadActivities(leadId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("activities")
    .select("id,lead_id,type,outcome,note,created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(25);

  return (data || []).map((item: any) => ({
    id: item.id,
    leadId: item.lead_id,
    type: item.type || "call",
    outcome: item.outcome || "",
    note: item.note || "",
    createdAt: item.created_at || ""
  }));
}
