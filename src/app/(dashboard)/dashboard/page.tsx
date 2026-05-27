import Link from "next/link";
import { BarChart3, CalendarCheck, PhoneCall, TrendingUp, Users } from "lucide-react";
import { getDashboardReport, getReportingReps } from "@/lib/reporting";

type DashboardPageProps = {
  searchParams?: Promise<{
    rep?: string;
  }>;
};

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-sm">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
        {icon}
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm font-semibold text-slate-400">{label}</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-slate-500">
      {label}
    </div>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const selectedRep = params?.rep || "all";

  const [report, reps] = await Promise.all([
    getDashboardReport(selectedRep, 14),
    getReportingReps(),
  ]);

  const selectedRepName =
    selectedRep === "all"
      ? "All Reps"
      : selectedRep === "unassigned"
        ? "Unassigned"
        : reps.find((rep) => rep.id === selectedRep)?.name || "Selected Rep";

  const maxCalls = Math.max(...report.callsByDay.map((day) => day.count), 1);
  const maxPipeline = Math.max(...report.pipelineBreakdown.map((item) => item.count), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
            SDR Reporting
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Calls, outcomes, booked meetings, and pipeline movement by rep.
          </p>
        </div>

        <form action="/dashboard" className="flex flex-col gap-2 sm:flex-row">
          <select
            name="rep"
            defaultValue={selectedRep}
            className="h-12 min-w-56 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm font-bold text-white outline-none ring-sky-400/40 focus:ring-2"
          >
            <option value="all">All Reps</option>
            <option value="unassigned">Unassigned</option>
            {reps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.name}
              </option>
            ))}
          </select>

          <button className="h-12 rounded-xl bg-sky-400 px-5 text-sm font-black text-black transition hover:bg-sky-300">
            View Rep
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 text-sm font-bold text-sky-100">
        Viewing: {selectedRepName}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Leads"
          value={report.totalLeads}
          icon={<Users className="size-5" />}
        />
        <MetricCard
          label="Calls Today"
          value={report.callsToday}
          icon={<PhoneCall className="size-5" />}
        />
        <MetricCard
          label="Connect Rate"
          value={`${report.connectRate}%`}
          icon={<TrendingUp className="size-5" />}
        />
        <MetricCard
          label="Booked This Week"
          value={report.bookedThisWeek}
          icon={<CalendarCheck className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6">
          <div className="mb-6 flex items-center gap-2">
            <BarChart3 className="size-5 text-sky-300" />
            <h2 className="text-lg font-black text-white">Calls Per Day</h2>
          </div>

          {report.callsByDay.some((day) => day.count > 0) ? (
            <div className="flex h-72 items-end gap-3">
              {report.callsByDay.map((day) => (
                <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-56 w-full items-end">
                    <div
                      className="w-full rounded-t-lg bg-sky-400"
                      style={{
                        height: `${Math.max((day.count / maxCalls) * 100, 3)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-slate-500">{day.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label="No calls logged for this rep yet." />
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="mb-6 text-lg font-black text-white">Outcome Breakdown</h2>

          {report.outcomeBreakdown.length > 0 ? (
            <div className="space-y-4">
              {report.outcomeBreakdown.map((item) => (
                <div key={item.outcome}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-white">{item.outcome}</span>
                    <span className="text-slate-400">
                      {item.count} / {item.percent}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-sky-400"
                      style={{ width: `${Math.max(item.percent, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label="No outcomes logged for this rep yet." />
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6">
        <h2 className="mb-6 text-lg font-black text-white">Pipeline Breakdown</h2>

        {report.pipelineBreakdown.length > 0 ? (
          <div className="space-y-4">
            {report.pipelineBreakdown.map((item) => (
              <div key={item.label} className="grid gap-3 md:grid-cols-[180px_1fr_60px] md:items-center">
                <div className="text-sm font-bold text-slate-300">{item.label}</div>
                <div className="h-4 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-sky-400"
                    style={{
                      width: `${Math.max((item.count / maxPipeline) * 100, 4)}%`,
                    }}
                  />
                </div>
                <div className="text-right text-sm font-black text-white">{item.count}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState label="No pipeline data yet." />
        )}
      </section>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-400">
        New calls will only show under a specific rep if the call log is saved with that rep
        attached. Older calls may appear under Unassigned.
      </div>
    </div>
  );
}
