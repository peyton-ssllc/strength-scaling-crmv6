import { PageHeader } from "@/components/crm/page-header";

export default function MembersPage() {
  return <><PageHeader eyebrow="Members" title="Team members" description="Manage admins, SDR reps, and visibility rules." /><div className="card p-6 text-slate-300">Authentication and member roles can be enabled next. For now, the CRM is focused on import, contacts, queue, and pipeline usage.</div></>;
}
