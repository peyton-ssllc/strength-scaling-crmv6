export function readableStatus(status: string | null | undefined) {
  const value = String(status || "new").replaceAll("-", "_").toLowerCase();
  const map: Record<string, string> = {
    new: "New",
    queued: "Queued",
    working: "Working",
    contacted: "Called",
    follow_up_scheduled: "Follow Up",
    meeting_booked: "Booked",
    qualified: "Interested",
    unqualified: "Unqualified",
    bad_data: "Bad Data",
    do_not_contact: "DNC",
    converted: "Client",
    lost: "Lost"
  };
  return map[value] || value.split("_").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

export function statusToDb(status: string) {
  const value = status.trim().toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");
  const map: Record<string, string> = {
    new: "new",
    queued: "queued",
    working: "working",
    called: "contacted",
    contacted: "contacted",
    callback: "follow_up_scheduled",
    follow_up: "follow_up_scheduled",
    interested: "qualified",
    qualified: "qualified",
    booked: "meeting_booked",
    meeting_booked: "meeting_booked",
    dnc: "do_not_contact",
    do_not_contact: "do_not_contact",
    lost: "lost",
    client: "converted",
    converted: "converted"
  };
  return map[value] || "contacted";
}

export const normalizeStatus = statusToDb;

export function clean(value: unknown) {
  return String(value || "").trim();
}

export function todayIso() {
  return new Date().toISOString();
}
