import { createSupabaseAdminClient } from "@/lib/supabase";
import { readableStatus } from "@/lib/format";

export type OutcomeMetric = {
  label: string;
  count: number;
  percent: number;
};

export type DayMetric = {
  label: string;
  calls: number;
};

export type PipelineMetric = {
  label: string;
  count: number;
};

export type RecentActivity = {
  id: string;
  leadId: string;
  business: string;
  outcome: string;
  note: string;
  createdAt: string;
};

function startOfWindow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function shortDay(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function normalizeOutcome(value: string | null | undefined) {
  const raw = String(value || "Called").trim().toLowerCase();
  if (raw.includes("book")) return "Booked";
  if (raw.includes("interest")) return "Interested";
  if (raw.includes("follow")) return "Follow Up";
  if (raw.includes("callback")) return "Callback";
  if (raw.includes("dnc") || raw.includes("dq")) return "DNC";
  if (raw.includes("lost")) return "Lost";
  if (raw.includes("no answer")) return "No Answer";
  if (raw.includes("vm") || raw.includes("voicemail")) return "Left VM";
  return "Called";
}

export async function getDashboardReport(days = 14) {
  const supabase = createSupabaseAdminClient();
  const since = startOfWindow(days);
  const sinceIso = since.toISOString();

  const [{ data: leads }, { data: activities }] = await Promise.all([
    supabase.from("leads").select("id,business_name,status,score,created_at"),
    supabase
      .from("activities")
      .select("id,lead_id,type,outcome,note,created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(1000)
  ]);

  const leadRows = leads || [];
  const activityRows = (activities || []).filter((item: any) => (item.type || "call") === "call");
  const leadById = new Map(leadRows.map((lead: any) => [lead.id, lead]));

  const totalLeads = leadRows.length;
  const calls = activityRows.length;
  const booked = activityRows.filter((item: any) => normalizeOutcome(item.outcome) === "Booked").length;
  const connected = activityRows.filter((item: any) => {
    const outcome = normalizeOutcome(item.outcome);
    return ["Booked", "Interested", "Follow Up", "Callback", "Called"].includes(outcome);
  }).length;

  const daysList: DayMetric[] = Array.from({ length: days }).map((_, index) => {
    const date = new Date(since);
    date.setDate(since.getDate() + index);
    return { label: shortDay(date), calls: 0 };
  });

  const dayIndexByKey = new Map<string, number>();
  daysList.forEach((_, index) => {
    const date = new Date(since);
    date.setDate(since.getDate() + index);
    dayIndexByKey.set(date.toISOString().slice(0, 10), index);
  });

  activityRows.forEach((item: any) => {
    const key = String(item.created_at || "").slice(0, 10);
    const index = dayIndexByKey.get(key);
    if (index !== undefined) daysList[index].calls += 1;
  });

  const outcomeCounts = new Map<string, number>();
  activityRows.forEach((item: any) => {
    const label = normalizeOutcome(item.outcome);
    outcomeCounts.set(label, (outcomeCounts.get(label) || 0) + 1);
  });

  const outcomes: OutcomeMetric[] = Array.from(outcomeCounts.entries())
    .map(([label, count]) => ({ label, count, percent: pct(count, calls) }))
    .sort((a, b) => b.count - a.count);

  const pipelineCounts = new Map<string, number>();
  leadRows.forEach((lead: any) => {
    const label = readableStatus(lead.status);
    pipelineCounts.set(label, (pipelineCounts.get(label) || 0) + 1);
  });

  const pipeline: PipelineMetric[] = Array.from(pipelineCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const recent: RecentActivity[] = activityRows.slice(0, 10).map((item: any) => {
    const lead = leadById.get(item.lead_id) as any;
    return {
      id: item.id,
      leadId: item.lead_id,
      business: lead?.business_name || "Unknown Lead",
      outcome: normalizeOutcome(item.outcome),
      note: item.note || "",
      createdAt: item.created_at || ""
    };
  });

  return {
    totalLeads,
    calls,
    booked,
    connected,
    connectRate: pct(connected, calls),
    bookedRate: pct(booked, calls),
    days: daysList,
    outcomes,
    pipeline,
    recent
  };
}
