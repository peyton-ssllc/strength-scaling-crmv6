import Link from "next/link";
import { DollarSign, Flame, Plus, Search, Snowflake, Sun, Users } from "lucide-react";
import { PageHeader } from "@/components/crm/page-header";
import { getLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function ranking(score: number) {
  if (score >= 75) return { label: "Hot", icon: Flame, className: "border-red-300/30 bg-red-400/10 text-red-200" };
  if (score >= 55) return { label: "Warm", icon: Sun, className: "border-yellow-300/30 bg-yellow-400/10 text-yellow-100" };
  return { label: "Cold", icon: Snowflake, className: "border-slate-300/20 bg-slate-400/10 text-slate-200" };
}

function stageLabel(status: string) {
  if (["Booked", "Interested"].includes(status)) return "Next Up";
  if (status === "Follow Up") return "Follow Up";
  if (status === "Lost") return "Former";
  return "Prospect";
}

export default async function PipelineClientsPage() {
  const leads = (await getLeads(500)).filter((lead) => !["DNC"].includes(lead.status));
  const potential = leads.filter((lead) => ["Interested", "Booked", "Follow Up", "Callback", "Called"].includes(lead.status));
  const active = leads.filter((lead) => lead.status === "Booked");
  const hot = potential.filter((lead) => lead.score >= 75).length;
  const warm = potential.filter((lead) => lead.score >= 55 && lead.score < 75).length;
  const cold = potential.filter((lead) => lead.score < 55).length;
  const pipelineValue = potential.reduce((sum, lead) => sum + Math.max(1000, Math.round(lead.score / 10) * 500), 0);
  const activeValue = active.length * 3000;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><PageHeader eyebrow="Pipeline & Clients" title="Potential client tracker" description="Track warm accounts, follow-ups, booked opportunities, and client handoff candidates." /><Link href="/import-leads" className="btn"><Plus className="size-4" /> New Account</Link></div>
      <div className="grid gap-4 lg:grid-cols-4"><div className="card p-5"><div className="label">Active Profit</div><div className="mt-3 text-3xl font-black text-white">{money(activeValue)}</div><div className="text-sm text-slate-500">{active.length} booked accounts</div></div><div className="card p-5"><div className="label">Pipeline Value</div><div className="mt-3 text-3xl font-black text-white">{money(pipelineValue)}</div><div className="text-sm text-slate-500">{potential.length} in pipeline</div></div><div className="card p-5"><div className="label">Profit Gap</div><div className="mt-3 text-3xl font-black text-white">{money(Math.max(0, pipelineValue - activeValue))}</div><div className="text-sm text-slate-500">Pipeline vs active</div></div><div className="card p-5"><div className="label">Total Opportunity</div><div className="mt-3 text-3xl font-black text-white">{money(pipelineValue + activeValue)}</div><div className="text-sm text-slate-500">Combined value</div></div></div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-6"><div className="surface p-4"><Users className="mb-3 size-5 text-emerald-300" /><div className="label">Active</div><div className="text-3xl font-black text-white">{active.length}</div></div><div className="surface p-4"><Flame className="mb-3 size-5 text-red-300" /><div className="label">Hot</div><div className="text-3xl font-black text-white">{hot}</div></div><div className="surface p-4"><Sun className="mb-3 size-5 text-yellow-200" /><div className="label">Warm</div><div className="text-3xl font-black text-white">{warm}</div></div><div className="surface p-4"><Snowflake className="mb-3 size-5 text-slate-300" /><div className="label">Cold</div><div className="text-3xl font-black text-white">{cold}</div></div><div className="surface p-4"><DollarSign className="mb-3 size-5 text-sky-300" /><div className="label">Paused</div><div className="text-3xl font-black text-white">0</div></div><div className="surface p-4"><Users className="mb-3 size-5 text-slate-300" /><div className="label">Former</div><div className="text-3xl font-black text-white">{leads.filter((lead)=>lead.status === "Lost").length}</div></div></div>
      <div className="mt-5 flex flex-col gap-3 md:flex-row"><div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-slate-500"><Search className="size-4" /> Search clients...</div><div className="input md:w-44">All Statuses</div><div className="input md:w-44">All Rankings</div><div className="input md:w-44">Hottest First</div></div>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {potential.map((lead) => {
          const rank = ranking(lead.score);
          const RankIcon = rank.icon;
          const value = Math.max(1000, Math.round(lead.score / 10) * 500);
          return <Link key={lead.id} href={`/contacts/${lead.id}`} className="card block p-5 hover:border-sky-300/30"><div className="mb-3 flex items-start justify-between gap-3"><div><h2 className="text-lg font-black text-white">{lead.business}</h2><p className="text-sm text-slate-500">{lead.contact || [lead.city, lead.state].filter(Boolean).join(", ") || "No contact"}</p></div><span className={`badge ${rank.className}`}><RankIcon className="mr-1 size-3" /> {rank.label}</span></div><div className="mb-3 flex gap-2"><span className="badge">{stageLabel(lead.status)}</span><span className="badge">Score {lead.score}</span></div><div className="surface p-4"><div className="flex items-end justify-between"><div><div className="text-2xl font-black text-white">{money(value)}</div><div className="label">Potential</div></div><div className="text-xs text-slate-500">Retainer: {money(value + 900)}</div></div></div><p className="mt-4 line-clamp-2 text-sm leading-5 text-slate-400">{lead.notes || `${lead.status} account from ${lead.source || "CRM"}. Open this account to log the next call or update notes.`}</p></Link>;
        })}
      </div>
    </>
  );
}
