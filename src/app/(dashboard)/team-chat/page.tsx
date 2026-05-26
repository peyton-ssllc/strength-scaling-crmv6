import { PageHeader } from "@/components/crm/page-header";

export default function TeamChatPage() {
  return <><PageHeader eyebrow="Team Chat" title="Team updates" description="A simple internal space for SDR notes and team coordination." /><div className="card p-6 text-slate-300">Team chat storage is ready in Supabase, but live messaging should be added after core CRM workflows are stable.</div></>;
}
