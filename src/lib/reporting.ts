import { requireCurrentProfile } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/admin";
import { isAdmin } from "@/lib/permissions";

export type ReportingRep = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type DashboardReport = {
  totalLeads: number;
  callsToday: number;
  connectRate: number;
  bookedThisWeek: number;
  callsByDay: { label: string; count: number }[];
  outcomeBreakdown: { outcome: string; count: number; percent: number }[];
  pipelineBreakdown: { label: string; count: number }[];
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function readableStatus(status: string | null | undefined) {
  if (!status) return "New";
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function getReportingReps(): Promise<ReportingRep[]> {
  const profile = await requireCurrentProfile();
  const supabase = createSupabaseAdminClient();

  if (!isAdmin(profile)) {
    return [{ id: profile.id, name: profile.full_name || profile.email, email: profile.email, role: profile.role }];
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  return (data ?? []).map((rep) => ({
    id: rep.id,
    name: rep.full_name || rep.email || "Unnamed Rep",
    email: rep.email || "",
    role: rep.role || "sdr",
  }));
}

export async function getDashboardReport(selectedRep: string = "all", days: number = 14): Promise<DashboardReport> {
  const profile = await requireCurrentProfile();
  const supabase = createSupabaseAdminClient();
  const effectiveRep = isAdmin(profile) ? selectedRep : profile.id;

  const since = daysAgo(days).toISOString();
  const today = startOfDay(new Date()).toISOString();
  const weekStart = daysAgo(7).toISOString();

  let leadsQuery = supabase.from("leads").select("id, status, assigned_to, pipeline_status, created_at");
  if (effectiveRep !== "all" && effectiveRep !== "unassigned") leadsQuery = leadsQuery.eq("assigned_to", effectiveRep);
  if (effectiveRep === "unassigned") leadsQuery = leadsQuery.is("assigned_to", null);

  const { data: leads } = await leadsQuery;

  let activitiesQuery = supabase
    .from("activities")
    .select("id, lead_id, rep_id, type, outcome, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (effectiveRep !== "all" && effectiveRep !== "unassigned") activitiesQuery = activitiesQuery.eq("rep_id", effectiveRep);
  if (effectiveRep === "unassigned") activitiesQuery = activitiesQuery.is("rep_id", null);

  const { data: activities } = await activitiesQuery;
  const safeLeads = leads ?? [];
  const safeActivities = activities ?? [];
  const calls = safeActivities.filter((activity) => activity.type === "call");
  const callsToday = calls.filter((activity) => activity.created_at >= today);
  const bookedThisWeek = safeActivities.filter(
    (activity) => activity.created_at >= weekStart && ["Booked", "Meeting Booked", "Booked Meeting"].includes(activity.outcome || "")
  );
  const connectedCalls = calls.filter((activity) => ["Connected", "Spoke", "Interested", "Booked", "Meeting Booked"].includes(activity.outcome || ""));
  const connectRate = calls.length > 0 ? Math.round((connectedCalls.length / calls.length) * 100) : 0;

  const callsByDay = Array.from({ length: days }).map((_, index) => {
    const date = daysAgo(days - index - 1);
    const dateKey = date.toISOString().slice(0, 10);
    return {
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: calls.filter((call) => call.created_at.slice(0, 10) === dateKey).length,
    };
  });

  const outcomeCounts = calls.reduce<Record<string, number>>((acc, activity) => {
    const outcome = activity.outcome || "No Outcome";
    acc[outcome] = (acc[outcome] ?? 0) + 1;
    return acc;
  }, {});

  const outcomeBreakdown = Object.entries(outcomeCounts)
    .map(([outcome, count]) => ({ outcome, count, percent: calls.length > 0 ? Math.round((count / calls.length) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  const pipelineCounts = safeLeads.reduce<Record<string, number>>((acc, lead) => {
    const label = readableStatus(lead.pipeline_status || lead.status);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const pipelineBreakdown = Object.entries(pipelineCounts).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);

  return { totalLeads: safeLeads.length, callsToday: callsToday.length, connectRate, bookedThisWeek: bookedThisWeek.length, callsByDay, outcomeBreakdown, pipelineBreakdown };
}
