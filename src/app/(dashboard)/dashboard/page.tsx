import { CalendarCheck, PhoneCall, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/crm/page-header";
import { getDashboardReport } from "@/lib/reporting";

export const dynamic = "force-dynamic";

function MetricCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string | number; hint: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className="grid size-11 place-items-center rounded-lg bg-sky-400/12 text-sky-300"><Icon className="size-5" /></div>
        <div><div className="text-3xl font-black text-white">{value}</div><div className="text-sm font-semibold text-slate-400">{label}</div></div>
      </div>
      <div className="mt-4 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

function BarChart({ days }: { days: { label: string; calls: number }[] }) {
  const max = Math.max(1, ...days.map((day) => day.calls));
  return <div className="flex h-64 items-end gap-2 border-b border-l border-white/10 px-3 pt-6">{days.map((day) => <div key={day.label} className="flex min-w-0 flex-1 flex-col items-center gap-2"><div className="w-full rounded-t bg-sky-400" style={{ height: `${Math.max(4, (day.calls / max) * 200)}px` }} title={`${day.calls} calls`} /><div className="truncate text-[11px] text-slate-500">{day.label}</div></div>)}</div>;
}

function OutcomeBars({ outcomes }: { outcomes: { label: string; count: number; percent: number }[] }) {
  return <div className="space-y-3">{outcomes.length ? outcomes.map((outcome) => <div key={outcome.label}><div className="mb-1 flex items-center justify-between text-sm"><span className="font-bold text-white">{outcome.label}</span><span className="text-sky-200">{outcome.count} · {outcome.percent}%</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-sky-400" style={{ width: `${outcome.percent}%` }} /></div></div>) : <p className="text-sm text-slate-400">No logged calls in this window yet.</p>}</div>;
}

export default async function DashboardPage() {
  const report = await getDashboardReport(14);
  const maxPipeline = Math.max(1, ...report.pipeline.map((stage) => stage.count));

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <PageHeader eyebrow="Dashboard" title="SDR reporting" description="Track calls, connect rate, booked meetings, outcome mix, and pipeline health." />
        <div className="flex gap-3"><div className="min-w-48 rounded-lg border border-sky-300/60 bg-black/35 px-4 py-3 text-sm font-bold text-white">All Reps</div><div className="min-w-40 rounded-lg border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold text-white">Last 14 days</div></div>
      </div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard icon={Users} label="Total Leads" value={report.totalLeads} hint="Leads currently in Supabase" /><MetricCard icon={PhoneCall} label="Calls Logged" value={report.calls} hint="Call activities in the last 14 days" /><MetricCard icon={TrendingUp} label="Connect Rate" value={`${report.connectRate}%`} hint={`${report.connected} connected conversations`} /><MetricCard icon={CalendarCheck} label="Booked" value={report.booked} hint={`${report.bookedRate}% of logged calls`} /></div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_.9fr]"><section className="card p-5"><div className="mb-4 font-black text-white">Calls Per Day</div><BarChart days={report.days} /></section><section className="card p-5"><div className="mb-5 font-black text-white">Outcome Breakdown</div><OutcomeBars outcomes={report.outcomes} /></section></div>
      <section className="card mt-5 p-5"><div className="mb-5 font-black text-white">Pipeline Breakdown</div><div className="space-y-3">{report.pipeline.map((stage) => <div key={stage.label} className="grid items-center gap-3 sm:grid-cols-[140px_1fr_60px]"><div className="text-sm font-bold text-slate-400">{stage.label}</div><div className="h-5 rounded bg-white/10"><div className="h-5 rounded bg-sky-400" style={{ width: `${Math.max(3, (stage.count / maxPipeline) * 100)}%` }} /></div><div className="text-right text-sm font-black text-white">{stage.count}</div></div>)}</div></section>
    </>
  );
}
