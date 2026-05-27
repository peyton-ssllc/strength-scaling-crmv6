import Link from "next/link";
import { BarChart3, Bell, CalendarDays, Contact, Import, LayoutDashboard, Search, Users, Workflow } from "lucide-react";
import { logout } from "@/app/login/actions";

const nav = [
  ["My Queue", "/queue", Contact],
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Contacts", "/contacts", Users],
  ["Calendar", "/calendar", CalendarDays],
  ["Pipeline & Clients", "/pipeline-clients", Workflow],
  ["Import Leads", "/import-leads", Import],
  ["Members", "/members", BarChart3]
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-white/10 bg-black/45 px-4 py-4 backdrop-blur lg:min-h-screen lg:border-b-0 lg:border-r lg:py-6">
        <Link href="/queue" className="flex items-center gap-3 rounded-lg px-2 py-1">
          <img src="/brand/strength-scaling-logo.png" alt="Strength Scaling" className="size-11 shrink-0 object-contain" />
          <div>
            <div className="text-lg font-black tracking-tight text-white">Strength Scaling</div>
            <div className="text-xs font-semibold text-slate-500">CRM</div>
          </div>
        </Link>
        <nav className="mt-7 grid gap-1">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-bold text-slate-400 hover:bg-sky-400/10 hover:text-white">
              <Icon className="size-4 text-slate-500 group-hover:text-sky-300" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="surface mt-8 p-4 text-sm text-slate-300">
          <div className="badge mb-3">Operating Mode</div>
          <p className="leading-5">Queue, contacts, reporting, calendar, and pipeline. Nothing extra in the way.</p>
        </div>
        <form action={logout}>
          <button type="submit" className="mt-4 flex h-10 w-full items-center rounded-lg px-3 text-left text-sm font-bold text-slate-500 hover:bg-white/[.04] hover:text-white">Sign Out</button>
        </form>
      </aside>
      <main className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-[#030712]/78 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <form action="/contacts" className="hidden h-10 w-full max-w-md items-center gap-3 rounded-lg border border-white/10 bg-white/[.035] px-3 text-sm text-slate-500 sm:flex">
              <Search className="size-4" />
              <input name="q" className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500" placeholder="Search contacts..." />
              <button type="submit" className="rounded border border-white/10 px-1.5 py-.5 text-xs font-bold text-slate-300 hover:text-white">Go</button>
            </form>
            <div className="ml-auto flex items-center gap-3">
              <button className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[.035] text-slate-300"><Bell className="size-4" /></button>
              <div className="text-right"><div className="text-sm font-bold text-white">Admin View</div><div className="text-xs text-slate-500">Strength Scaling</div></div>
            </div>
          </div>
        </header>
        <div className="px-4 py-7 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">{children}</div></div>
      </main>
    </div>
  );
}
