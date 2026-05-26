import { CalendarDays, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/crm/page-header";

export const dynamic = "force-dynamic";

export default function CalendarPage() {
  const calendarUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL;

  return (
    <>
      <PageHeader eyebrow="Calendar" title="Sales calendar" description="Use this page for booked calls, follow-ups, and team scheduling." />
      {calendarUrl ? (
        <div className="card overflow-hidden p-2"><iframe title="Google Calendar" src={calendarUrl} className="h-[720px] w-full rounded-md border-0 bg-white" /></div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
          <section className="card p-8"><div className="mb-4 grid size-12 place-items-center rounded-lg bg-sky-400/12 text-sky-300"><CalendarDays className="size-6" /></div><h2 className="text-2xl font-black text-white">Connect Google Calendar with an embed link</h2><p className="mt-3 text-sm leading-6 text-slate-400">For the fastest usable version, add your Google Calendar embed URL to Vercel as an environment variable. This avoids a full Google OAuth setup and gives the team one shared scheduling view inside the CRM.</p><a href="https://calendar.google.com" target="_blank" className="btn mt-5 w-fit" rel="noreferrer"><ExternalLink className="size-4" /> Open Google Calendar</a></section>
          <aside className="surface p-5"><div className="label">Vercel Env Var</div><p className="mt-3 text-sm leading-6 text-slate-300">Add this in Vercel if you want the calendar embedded here:</p><pre className="mt-4 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-sky-100">NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL</pre><p className="mt-4 text-sm leading-6 text-slate-400">Later, we can build true Google account login and two-way event creation, but that is a bigger auth feature.</p></aside>
        </div>
      )}
    </>
  );
}
